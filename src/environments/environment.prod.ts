// Production config reads from window.__env which is injected at deploy time
// by Netlify (see netlify.toml build command).
// Guard against server-side rendering where `window` is not available.
const _env = typeof window !== 'undefined' ? (window as any).__env ?? {} : {};
export const environment = {
  production: true,
  supabaseUrl: _env['SUPABASE_URL'] || '',
  supabaseKey: _env['SUPABASE_KEY'] || '',
};
