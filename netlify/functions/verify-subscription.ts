import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import DodoPayments from 'dodopayments';
import { createClient } from '@supabase/supabase-js';

const dodo = new DodoPayments({
  bearerToken: process.env['DODO_PAYMENTS_API_KEY']!,
  environment: (process.env['DODO_ENV'] as 'live_mode' | 'test_mode') || 'live_mode',
});

const supabase = createClient(
  process.env['SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_KEY']!,
);

const PRO_PRODUCT_ID = process.env['DODO_PRO_PRODUCT_ID']!;

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(event), body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(event), body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const { userId, userEmail } = JSON.parse(event.body || '{}');
  if (!userId || !userEmail) {
    return { statusCode: 400, headers: corsHeaders(event), body: JSON.stringify({ error: 'userId and userEmail required' }) };
  }

  try {
    // List all subscriptions for the Pro product (no status filter — catch pending/active/on_hold)
    const subs = await dodo.subscriptions.list({ product_id: PRO_PRODUCT_ID });

    console.log(`verify-subscription: found ${subs.items.length} total subscriptions for product`);
    subs.items.forEach((s) =>
      console.log(` - id=${s.subscription_id} status=${s.status} email=${s.customer?.email} metadata=${JSON.stringify(s.metadata)}`),
    );

    // Match by customer email or metadata supabase_user_id
    const match = subs.items.find(
      (s) =>
        (s.customer?.email === userEmail || s.metadata?.['supabase_user_id'] === userId) &&
        ['active', 'on_hold', 'pending'].includes(s.status),
    );

    if (match) {
      console.log(`verify-subscription: upgrading user ${userId} to pro (subscription ${match.subscription_id})`);
      const { error } = await supabase
        .from('profiles')
        .update({ plan: 'pro', request_limit: 100_000, endpoint_limit: -1 })
        .eq('id', userId);

      if (error) console.error('Supabase update error:', error);

      return {
        statusCode: 200,
        headers: { ...corsHeaders(event), 'Content-Type': 'application/json' },
        body: JSON.stringify({ upgraded: true }),
      };
    }

    console.log(`verify-subscription: no active subscription found for email=${userEmail} userId=${userId}`);
    return {
      statusCode: 200,
      headers: { ...corsHeaders(event), 'Content-Type': 'application/json' },
      body: JSON.stringify({ upgraded: false }),
    };
  } catch (err) {
    console.error('verify-subscription error:', err);
    return { statusCode: 500, headers: corsHeaders(event), body: JSON.stringify({ error: 'Internal error' }) };
  }
};

function corsHeaders(event: HandlerEvent): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': event.headers.origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export { handler };
