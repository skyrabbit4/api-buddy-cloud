import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    if (!environment.production && (window as any).supabaseClient) {
      this.supabase = (window as any).supabaseClient;
    } else {
      this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
        auth: {
          flowType: 'pkce',
          detectSessionInUrl: true,
          autoRefreshToken: true,
          persistSession: true,
        },
      });
      if (!environment.production) {
        (window as any).supabaseClient = this.supabase;
      }
    }
  }

  getSupabase() {
    return this.supabase;
  }
}
