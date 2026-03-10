import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface UserProfile {
  id: string;
  plan: 'free' | 'pro' | 'enterprise';
  requestLimit: number;
  endpointLimit: number;
}

export interface UsageStats {
  currentMonth: string;
  requestCount: number;
  requestLimit: number;
  endpointCount: number;
  endpointLimit: number;
  usagePercent: number;
}

@Injectable({
  providedIn: 'root',
})
export class UsageService {
  private _profile = new BehaviorSubject<UserProfile | null>(null);
  private _usage = new BehaviorSubject<UsageStats | null>(null);
  private _loading = new BehaviorSubject<boolean>(false);

  public profile$ = this._profile.asObservable();
  public usage$ = this._usage.asObservable();
  public loading$ = this._loading.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService,
  ) {
    this.authService.session$.subscribe((session) => {
      if (session) {
        this.loadUsage();
      } else {
        this._profile.next(null);
        this._usage.next(null);
      }
    });
  }

  private get supabase() {
    return this.supabaseService.getSupabase();
  }

  async loadUsage(): Promise<void> {
    const userId = this.authService.currentSession?.user?.id;
    if (!userId) return;

    this._loading.next(true);

    try {
      // Get profile
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        this._profile.next({
          id: profile.id,
          plan: profile.plan,
          requestLimit: profile.request_limit,
          endpointLimit: profile.endpoint_limit,
        });
      }

      // Get current month's usage
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const { data: usage } = await this.supabase
        .from('usage')
        .select('request_count')
        .eq('user_id', userId)
        .eq('month', currentMonth)
        .single();

      // Get endpoint count
      const { count: endpointCount } = await this.supabase
        .from('endpoints')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const requestCount = usage?.request_count || 0;
      const requestLimit = profile?.request_limit || 1000;
      const endpointLimit = profile?.endpoint_limit || 5;

      this._usage.next({
        currentMonth,
        requestCount,
        requestLimit,
        endpointCount: endpointCount || 0,
        endpointLimit,
        usagePercent: Math.min(100, Math.round((requestCount / requestLimit) * 100)),
      });
    } catch (err) {
      console.error('Failed to load usage:', err);
    } finally {
      this._loading.next(false);
    }
  }

  getUsage(): UsageStats | null {
    return this._usage.getValue();
  }
}
