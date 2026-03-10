import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-auth-callback',
  standalone: false,
  templateUrl: './auth-callback.html',
  styleUrl: './auth-callback.css',
})
export class AuthCallbackComponent implements OnInit, OnDestroy {
  message = 'Signing you in...';

  private sub: Subscription | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // With PKCE flow + detectSessionInUrl: true, Supabase automatically
    // detects the code in the URL and exchanges it for a session.
    // We simply wait for AuthService to report a valid session via
    // onAuthStateChange (SIGNED_IN event).
    this.sub = this.authService.session$
      .pipe(
        filter((session) => session !== null),
        take(1),
      )
      .subscribe(() => {
        this.clearTimeoutFn();
        // Remove the code/state params from the URL so they are not
        // replayed or leaked via browser history / referrer headers.
        window.history.replaceState(null, '', window.location.pathname);
        this.router.navigate(['/dashboard']);
      });

    // Fallback: if no session arrives within 8 seconds, treat as failure.
    this.timeoutId = setTimeout(() => {
      this.sub?.unsubscribe();
      this.sub = null;

      if (!environment.production) {
        console.warn('Auth callback: no session received within timeout.');
      }

      this.message = 'Sign in failed. Redirecting...';
      setTimeout(() => this.router.navigate(['/login']), 2000);
    }, 8000);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.clearTimeoutFn();
  }

  private clearTimeoutFn(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
