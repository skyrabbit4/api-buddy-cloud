import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-auth-callback',
  standalone: false,
  templateUrl: './auth-callback.html',
  styleUrl: './auth-callback.css',
})
export class AuthCallbackComponent implements OnInit {
  message = 'Signing you in...';

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit(): Promise<void> {
    const supabase = this.supabaseService.getSupabase();
    const hash = window.location.hash;

    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('Auth callback setSession error:', error.message);
        } else if (data.session) {
          window.history.replaceState(null, '', window.location.pathname);
          this.router.navigate(['/']);
          return;
        }
      }
    }

    this.message = 'Sign in failed. Redirecting...';
    setTimeout(() => this.router.navigate(['/login']), 2000);
  }
}
