import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { MockStoreService, MockEndpoint } from '../../services/mock-store.service';
import { UsageService, UsageStats, UserProfile } from '../../services/usage.service';
import { SupabaseService } from '../../services/supabase.service';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Session } from '@supabase/supabase-js';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  session$: Observable<Session | null>;
  firstName$: Observable<string>;
  endpoints$: Observable<MockEndpoint[]>;
  loading$: Observable<boolean>;
  usage$: Observable<UsageStats | null>;
  profile$: Observable<UserProfile | null>;
  showPaymentSuccess = false;

  // Chart data for last 7 days
  chartData: { day: string; count: number }[] = [];
  chartMax = 0;

  private _pollInterval: ReturnType<typeof setInterval> | null = null;
  private _profileSub: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private mockStore: MockStoreService,
    private usageService: UsageService,
    private supabaseService: SupabaseService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
  ) {
    this.session$ = this.authService.session$;
    this.endpoints$ = this.mockStore.endpoints$;
    this.loading$ = this.mockStore.loading$;
    this.usage$ = this.usageService.usage$;
    this.profile$ = this.usageService.profile$;
    this.firstName$ = this.session$.pipe(
      map((session) => {
        if (!session?.user) return '';
        const meta = session.user.user_metadata || {};
        const fullName =
          meta['full_name'] || meta['name'] || session.user.email?.split('@')[0] || '';
        return fullName.split(' ')[0];
      }),
    );

    if (this.route.snapshot.queryParamMap.get('payment') === 'success') {
      this.showPaymentSuccess = true;
      this.router.navigate([], { replaceUrl: true });
      this.pollUntilPlanUpgraded();
    }
  }

  async ngOnInit(): Promise<void> {
    await this.loadChartData();
  }

  private async loadChartData(): Promise<void> {
    const supabase = this.supabaseService.getSupabase();
    if (!supabase) return;

    const userId = this.authService.currentSession?.user?.id;
    if (!userId) return;

    const days: { day: string; count: number }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().slice(0, 10);
      const dayLabel = date.toLocaleDateString('en', { weekday: 'short' });

      const { count } = await supabase
        .from('request_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', `${dayStr}T00:00:00`)
        .lt('created_at', `${dayStr}T23:59:59`);

      days.push({ day: dayLabel, count: count || 0 });
    }

    this.chartData = days;
    this.chartMax = Math.max(...days.map((d) => d.count), 1);
  }

  exportEndpoints(): void {
    const endpoints = this.mockStore.getEndpoints();
    const exportData = endpoints.map((e) => ({
      name: e.name,
      method: e.method,
      path: e.path,
      statusCode: e.statusCode,
      responseBody: e.responseBody,
      responseHeaders: e.responseHeaders,
      webhookUrl: e.webhookUrl,
      delay: e.delay,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mockapi-endpoints-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importEndpoints(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!Array.isArray(data)) {
          alert('Invalid file format. Expected an array of endpoints.');
          return;
        }
        const count = await this.mockStore.importEndpoints(data);
        alert(`Successfully imported ${count} endpoint(s).`);
      } catch {
        alert('Failed to parse JSON file.');
      }
    };
    input.click();
  }

  private pollUntilPlanUpgraded(): void {
    const user = this.authService.currentSession?.user;
    if (!user) return;

    let attempts = 0;
    this._pollInterval = setInterval(() => {
      attempts++;
      this.http.post<{ upgraded: boolean }>('/.netlify/functions/verify-subscription', {
        userId: user.id,
        userEmail: user.email,
      })
        .subscribe({
          next: async ({ upgraded }) => {
            await this.usageService.loadUsage();
            if (upgraded || attempts >= 8) {
              this.clearPoll();
            }
          },
          error: async () => {
            await this.usageService.loadUsage();
            if (attempts >= 8) this.clearPoll();
          },
        });
    }, 2500);

    this._profileSub = this.usageService.profile$.subscribe((profile) => {
      if (profile?.plan === 'pro') {
        this.clearPoll();
      }
    });
  }

  private verifySilently(): void {
    const user = this.authService.currentSession?.user;
    if (!user) return;
    this.http.post<{ upgraded: boolean }>('/.netlify/functions/verify-subscription', {
      userId: user.id,
      userEmail: user.email,
    }).subscribe({
      next: async ({ upgraded }) => {
        if (upgraded) await this.usageService.loadUsage();
      },
      error: () => {},
    });
  }

  private clearPoll(): void {
    if (this._pollInterval !== null) {
      clearInterval(this._pollInterval);
      this._pollInterval = null;
    }
    if (this._profileSub) {
      this._profileSub.unsubscribe();
      this._profileSub = null;
    }
  }

  ngOnDestroy(): void {
    this.clearPoll();
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  signOut(): Promise<void> {
    return this.authService.signOut();
  }

  trackByEndpointId(_index: number, endpoint: MockEndpoint): string {
    return endpoint.id;
  }

  getBarHeight(count: number): number {
    if (this.chartMax === 0) return 4;
    return Math.max(4, (count / this.chartMax) * 80);
  }

  upgradeToPro(): void {
    const user = this.authService.currentSession?.user;
    if (!user) return;

    this.http.post<{ checkoutUrl: string }>('/.netlify/functions/create-checkout', {
      plan: 'pro',
      userId: user.id,
      userEmail: user.email,
      userName: user.user_metadata?.['full_name'] || user.email,
    }).subscribe({
      next: ({ checkoutUrl }) => {
        window.location.href = checkoutUrl;
      },
      error: (err) => {
        console.error('Checkout error:', err);
      },
    });
  }
}
