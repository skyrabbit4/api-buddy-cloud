// Dev config reads from window.__env (set via public/env.js).
// Create public/env.js locally with your Supabase anon key (JWT format starting with eyJ...).
// Guard against server-side rendering where `window` is not available.
const _env = typeof window !== 'undefined' ? (window as any).__env ?? {} : {};
export const environment = {
  production: false,
  supabaseUrl: _env['SUPABASE_URL'] || '',
  supabaseKey: _env['SUPABASE_KEY'] || '',
};
