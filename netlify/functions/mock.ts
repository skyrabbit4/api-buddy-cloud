import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  // Extract endpoint ID from path: /m/{id}
  const pathParts = event.path.split('/');
  const endpointId = pathParts[pathParts.length - 1];

  if (!endpointId) {
    return {
      statusCode: 400,
      headers: corsHeaders(event),
      body: JSON.stringify({ error: 'Missing endpoint ID' }),
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders(event),
      body: '',
    };
  }

  try {
    // Fetch the endpoint from Supabase
    const { data: endpoint, error } = await supabase
      .from('endpoints')
      .select('*')
      .eq('id', endpointId)
      .eq('is_active', true)
      .single();

    if (error || !endpoint) {
      return {
        statusCode: 404,
        headers: corsHeaders(event),
        body: JSON.stringify({ error: 'Endpoint not found or inactive' }),
      };
    }

    // Check if request method matches (or endpoint accepts any method)
    if (endpoint.method !== 'ANY' && endpoint.method !== event.httpMethod) {
      return {
        statusCode: 405,
        headers: corsHeaders(event),
        body: JSON.stringify({
          error: `Method not allowed. Expected ${endpoint.method}, got ${event.httpMethod}`,
        }),
      };
    }

    // Apply delay if configured
    if (endpoint.delay > 0) {
      await sleep(endpoint.delay);
    }

    // Return the mock response
    return {
      statusCode: endpoint.status_code,
      headers: {
        ...corsHeaders(event),
        'Content-Type': 'application/json',
        'X-MockAPI-Endpoint': endpoint.name,
      },
      body: typeof endpoint.response_body === 'string'
        ? endpoint.response_body
        : JSON.stringify(endpoint.response_body),
    };
  } catch (err) {
    console.error('Error serving mock endpoint:', err);
    return {
      statusCode: 500,
      headers: corsHeaders(event),
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

function corsHeaders(event: HandlerEvent): Record<string, string> {
  const origin = event.headers.origin || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { handler };
