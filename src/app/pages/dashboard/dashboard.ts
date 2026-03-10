import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MockStoreService, MockEndpoint } from '../../services/mock-store.service';
import { UsageService, UsageStats, UserProfile } from '../../services/usage.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Session } from '@supabase/supabase-js';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  session$: Observable<Session | null>;
  firstName$: Observable<string>;
  endpoints$: Observable<MockEndpoint[]>;
  loading$: Observable<boolean>;
  usage$: Observable<UsageStats | null>;
  profile$: Observable<UserProfile | null>;

  constructor(
    private authService: AuthService,
    private mockStore: MockStoreService,
    private usageService: UsageService,
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
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  trackByEndpointId(_index: number, endpoint: MockEndpoint): string {
    return endpoint.id;
  }
}
