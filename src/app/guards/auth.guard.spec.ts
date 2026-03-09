import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { Session } from '@supabase/supabase-js';

import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

const mockSession = { user: { id: 'user-1' } } as Session;

function makeAuthService(isLoaded: boolean, session: Session | null) {
  const _isLoaded = new BehaviorSubject<boolean>(isLoaded);
  const _session = new BehaviorSubject<Session | null>(session);
  return {
    isLoaded$: _isLoaded.asObservable(),
    session$: _session.asObservable(),
    _isLoaded,
    _session,
  };
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: Router;

  const setup = (isLoaded: boolean, session: Session | null) => {
    const authService = makeAuthService(isLoaded, session);
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authService },
      ],
    });
    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
  };

  it('should be created', () => {
    setup(true, mockSession);
    expect(guard).toBeTruthy();
  });

  it('allows navigation when session exists', (done) => {
    setup(true, mockSession);
    (guard.canActivate() as any).subscribe((result: boolean) => {
      expect(result).toBeTrue();
      done();
    });
  });

  it('blocks navigation and redirects to /login when no session', (done) => {
    setup(true, null);
    const navigateSpy = spyOn(router, 'navigate');
    (guard.canActivate() as any).subscribe((result: boolean) => {
      expect(result).toBeFalse();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
      done();
    });
  });

  it('waits for isLoaded$ to emit true before checking session', (done) => {
    setup(false, mockSession);
    const authService = TestBed.inject(AuthService) as any;
    let resolved = false;

    (guard.canActivate() as any).subscribe((result: boolean) => {
      resolved = true;
      expect(result).toBeTrue();
      done();
    });

    expect(resolved).toBeFalse();
    authService._isLoaded.next(true);
  });
});
