// Production config reads from window.__env which is injected at deploy time
// by Netlify (see netlify.toml build command).
export const environment = {
  production: true,
  supabaseUrl: (window as any).__env?.SUPABASE_URL || '',
  supabaseKey: (window as any).__env?.SUPABASE_KEY || '',
};
