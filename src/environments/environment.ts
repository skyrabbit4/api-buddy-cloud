// WARNING: In production, these values should come from environment variables
// set at build time. See README for configuration instructions.
export const environment = {
  production: false,
  supabaseUrl: (window as any).__env?.SUPABASE_URL || 'https://iqcinepqgduogpkpvbhg.supabase.co',
  supabaseKey:
    (window as any).__env?.SUPABASE_KEY || 'sb_publishable_v6aMVy0leo1F7VMgZl9aYQ_BYuM3VRw',
};
