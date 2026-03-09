import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class MockSupabaseService {
  getSupabase(): SupabaseClient {
    return {
      auth: {
        onAuthStateChange: () => {
          return {
            data: { subscription: { unsubscribe: () => {} } },
          };
        },
      },
    } as any;
  }
}
