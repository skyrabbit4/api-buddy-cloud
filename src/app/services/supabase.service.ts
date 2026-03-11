import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

const WINDOW_KEY = '__supabaseClient';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient | null = null;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    if (!isPlatformBrowser(platformId)) return;

    // Reuse an existing client cached on window to avoid duplicate instances
    // during HMR (dev) or any second Angular bootstrap, which would otherwise
    // cause "Navigator LockManager lock immediately failed" errors from Supabase.
    if ((window as any)[WINDOW_KEY]) {
      this.supabase = (window as any)[WINDOW_KEY];
      return;
    }

    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        autoRefreshToken: true,
        persistSession: true,
      },
    });
    (window as any)[WINDOW_KEY] = this.supabase;
  }

  getSupabase(): SupabaseClient | null {
    return this.supabase;
  }
}
