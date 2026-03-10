// Dev config reads from window.__env (set via public/env.js).
// Create public/env.js locally with your Supabase anon key (JWT format starting with eyJ...).
export const environment = {
  production: false,
  supabaseUrl: (window as any).__env?.SUPABASE_URL || '',
  supabaseKey: (window as any).__env?.SUPABASE_KEY || '',
};
