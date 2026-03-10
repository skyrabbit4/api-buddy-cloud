import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  const startTime = Date.now();

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
      .select('*, user_id')
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

    // Check usage limits
    const { data: usageData, error: usageError } = await supabase
      .rpc('increment_usage', { p_user_id: endpoint.user_id });

    if (usageError) {
      console.error('Usage tracking error:', usageError);
      // Continue serving even if tracking fails
    } else if (usageData && usageData.length > 0 && !usageData[0].is_allowed) {
      return {
        statusCode: 429,
        headers: corsHeaders(event),
        body: JSON.stringify({
          error: 'Rate limit exceeded',
          message: `Monthly limit of ${usageData[0].limit_count} requests reached. Upgrade to Pro for more.`,
          current: usageData[0].current_count,
          limit: usageData[0].limit_count,
        }),
      };
    }

    // Check if request method matches
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

    const responseTime = Date.now() - startTime;

    // Log request (async, don't await)
    logRequest(endpoint.id, endpoint.user_id, event.httpMethod!, endpoint.status_code, responseTime);

    // Return the mock response
    return {
      statusCode: endpoint.status_code,
      headers: {
        ...corsHeaders(event),
        'Content-Type': 'application/json',
        'X-MockAPI-Endpoint': endpoint.name,
        'X-MockAPI-Response-Time': `${responseTime}ms`,
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

// Fire-and-forget request logging
function logRequest(
  endpointId: string,
  userId: string,
  method: string,
  statusCode: number,
  responseTimeMs: number,
): void {
  supabase
    .from('request_logs')
    .insert({
      endpoint_id: endpointId,
      user_id: userId,
      method,
      status_code: statusCode,
      response_time_ms: responseTimeMs,
    })
    .then(({ error }) => {
      if (error) console.error('Failed to log request:', error);
    });
}

export { handler };
