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

  const { userId } = JSON.parse(event.body || '{}');
  if (!userId) {
    return { statusCode: 400, headers: corsHeaders(event), body: JSON.stringify({ error: 'userId required' }) };
  }

  try {
    // List active subscriptions for the Pro product
    const subs = await dodo.subscriptions.list({
      product_id: PRO_PRODUCT_ID,
      status: 'active',
    });

    const match = subs.items.find((s) => s.metadata?.['supabase_user_id'] === userId);

    if (match) {
      await supabase
        .from('profiles')
        .update({ plan: 'pro', request_limit: 100_000, endpoint_limit: -1 })
        .eq('id', userId);

      return {
        statusCode: 200,
        headers: { ...corsHeaders(event), 'Content-Type': 'application/json' },
        body: JSON.stringify({ upgraded: true }),
      };
    }

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
