import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import DodoPayments from 'dodopayments';

const dodo = new DodoPayments({
  bearerToken: process.env['DODO_PAYMENTS_API_KEY']!,
  environment: (process.env['DODO_ENV'] as 'live_mode' | 'test_mode') || 'live_mode',
});

// Map plan names to Dodo product IDs (set these in your Netlify env vars)
const PLAN_PRODUCT_IDS: Record<string, string> = {
  pro: process.env['DODO_PRO_PRODUCT_ID']!,
};

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(event), body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders(event),
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { plan, userEmail, userName, userId } = JSON.parse(event.body || '{}');

    if (!plan || !PLAN_PRODUCT_IDS[plan]) {
      return {
        statusCode: 400,
        headers: corsHeaders(event),
        body: JSON.stringify({ error: 'Invalid plan' }),
      };
    }

    if (!userEmail) {
      return {
        statusCode: 400,
        headers: corsHeaders(event),
        body: JSON.stringify({ error: 'User email is required' }),
      };
    }

    const productId = PLAN_PRODUCT_IDS[plan];
    const origin = event.headers.origin || `https://${event.headers.host}`;

    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email: userEmail,
        name: userName || userEmail,
        create_new_customer: false,
      },
      metadata: { supabase_user_id: userId || '' },
      return_url: `${origin}/dashboard?payment=success`,
      trial_period_days: 7,
    });

    return {
      statusCode: 200,
      headers: { ...corsHeaders(event), 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkoutUrl: session.checkout_url }),
    };
  } catch (err: any) {
    console.error('Checkout creation error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders(event),
      body: JSON.stringify({ error: 'Failed to create checkout session' }),
    };
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
