import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MockStoreService, MockEndpoint } from '../../services/mock-store.service';
import { Observable } from 'rxjs';
import { Session } from '@supabase/supabase-js';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  session$: Observable<Session | null>;
  endpoints: MockEndpoint[] = [];

  constructor(
    private authService: AuthService,
    private mockStore: MockStoreService
  ) {
    this.session$ = this.authService.session$;
  }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.endpoints = this.mockStore.getEndpoints();
  }

  signOut(): void {
    this.authService.signOut();
  }
}
