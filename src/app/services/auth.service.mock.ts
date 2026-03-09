import { Injectable } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class MockAuthService {
  private _session = new BehaviorSubject<Session | null>(null);
  private _isLoaded = new BehaviorSubject<boolean>(false);

  public session$: Observable<Session | null> = this._session.asObservable();
  public isLoaded$: Observable<boolean> = this._isLoaded.asObservable();

  signInWithGoogle(): Promise<void> {
    return Promise.resolve();
  }

  signInWithGitHub(): Promise<void> {
    return Promise.resolve();
  }

  signOut(): Promise<void> {
    return Promise.resolve();
  }
}
