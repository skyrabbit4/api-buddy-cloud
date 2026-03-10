import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MockStoreService, MockEndpoint } from '../../services/mock-store.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Session } from '@supabase/supabase-js';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  session$: Observable<Session | null>;
  firstName$: Observable<string>;
  endpoints: MockEndpoint[] = [];

  constructor(
    private authService: AuthService,
    private mockStore: MockStoreService,
  ) {
    this.session$ = this.authService.session$;
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

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.endpoints = this.mockStore.getEndpoints();
  }

  trackByEndpointId(_index: number, endpoint: MockEndpoint): string {
    return endpoint.id;
  }
}
