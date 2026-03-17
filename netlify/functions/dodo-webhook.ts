import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

const supabase = createClient(
  process.env['SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_KEY']!,
);

const WEBHOOK_SECRET = process.env['DODO_WEBHOOK_SECRET']!;

// Plan limits to apply when a subscription goes active
const PRO_LIMITS = {
  plan: 'pro',
  request_limit: 100_000,
  endpoint_limit: 1_000_000,
};

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const body = event.body || '';

  // Verify webhook signature from Dodo Payments
  if (WEBHOOK_SECRET) {
    const signature = event.headers['webhook-signature'] || '';
    const webhookId = event.headers['webhook-id'] || '';
    const timestamp = event.headers['webhook-timestamp'] || '';

    const signedContent = `${webhookId}.${timestamp}.${body}`;
    const expectedSignatures = WEBHOOK_SECRET.split(' ').map((secret) => {
      const key = secret.replace(/^whsec_/, '');
      return 'v1,' + createHmac('sha256', Buffer.from(key, 'base64')).update(signedContent).digest('base64');
    });

    const isValid = signature
      .split(' ')
      .some((sig: string) => expectedSignatures.includes(sig));

    if (!isValid) {
      console.error('Invalid webhook signature');
      return { statusCode: 401, body: 'Invalid signature' };
    }
  }

  try {
    const payload = JSON.parse(body);
    const eventType: string = payload.type || payload.event_type;
    const data = payload.data || payload;

    console.log('Dodo webhook event:', eventType);

    switch (eventType) {
      case 'subscription.active':
      case 'subscription.renewed': {
        const userId = data.metadata?.supabase_user_id || data.customer?.metadata?.supabase_user_id;
        if (!userId) {
          console.warn('No supabase_user_id in webhook metadata');
          break;
        }
        await supabase
          .from('profiles')
          .update(PRO_LIMITS)
          .eq('id', userId);
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.expired': {
        const userId = data.metadata?.supabase_user_id || data.customer?.metadata?.supabase_user_id;
        if (!userId) break;
        await supabase
          .from('profiles')
          .update({ plan: 'free', request_limit: 1_000, endpoint_limit: 5 })
          .eq('id', userId);
        break;
      }

      default:
        console.log('Unhandled webhook event:', eventType);
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('Webhook error:', err);
    return { statusCode: 500, body: 'Internal server error' };
  }
};

export { handler };
