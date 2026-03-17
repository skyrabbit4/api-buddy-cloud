import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { MockStoreService, MockEndpoint } from '../../services/mock-store.service';
import { UsageService, UsageStats, UserProfile } from '../../services/usage.service';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Session } from '@supabase/supabase-js';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnDestroy {
  session$: Observable<Session | null>;
  firstName$: Observable<string>;
  endpoints$: Observable<MockEndpoint[]>;
  loading$: Observable<boolean>;
  usage$: Observable<UsageStats | null>;
  profile$: Observable<UserProfile | null>;
  showPaymentSuccess = false;

  private _pollInterval: ReturnType<typeof setInterval> | null = null;
  private _profileSub: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private mockStore: MockStoreService,
    private usageService: UsageService,
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
    } else {
      // Self-heal: if profile is free but user may have already paid, verify once on load
      this._profileSub = this.usageService.profile$.subscribe((profile) => {
        if (profile && profile.plan === 'free') {
          this._profileSub?.unsubscribe();
          this._profileSub = null;
          this.verifySilently();
        } else if (profile) {
          this._profileSub?.unsubscribe();
          this._profileSub = null;
        }
      });
    }
  }

  private pollUntilPlanUpgraded(): void {
    const userId = this.authService.currentSession?.user?.id;
    if (!userId) return;

    let attempts = 0;
    this._pollInterval = setInterval(() => {
      attempts++;
      // Call verify-subscription to pull-check Dodo and update Supabase if confirmed
      this.http.post<{ upgraded: boolean }>('/.netlify/functions/verify-subscription', { userId })
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
    const userId = this.authService.currentSession?.user?.id;
    if (!userId) return;
    this.http.post<{ upgraded: boolean }>('/.netlify/functions/verify-subscription', { userId })
      .subscribe({
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
}
