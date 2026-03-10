import { Injectable } from '@angular/core';
import { AuthChangeEvent, Session, SupabaseClient } from '@supabase/supabase-js';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase: SupabaseClient;
  private _session = new BehaviorSubject<Session | null>(null);
  private _isLoaded = new BehaviorSubject<boolean>(false);

  public session$: Observable<Session | null> = this._session.asObservable();
  public isLoaded$: Observable<boolean> = this._isLoaded.asObservable();

  get currentSession(): Session | null {
    return this._session.getValue();
  }

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
  ) {
    this.supabase = this.supabaseService.getSupabase();

    // onAuthStateChange handles everything:
    // - INITIAL_SESSION: fires on first load with existing session (or null)
    // - SIGNED_IN: fires after OAuth redirect with tokens in URL hash
    // - SIGNED_OUT: fires on sign out
    // - TOKEN_REFRESHED: fires on token refresh
    this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      this._session.next(session);
      this._isLoaded.next(true);

      if (event === 'SIGNED_OUT') {
        this.router.navigate(['/']);
      }
    });
  }

  async signInWithGoogle(): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    });
    if (error) throw error;
  }

  async signInWithGitHub(): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    });
    if (error) throw error;
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }
}
