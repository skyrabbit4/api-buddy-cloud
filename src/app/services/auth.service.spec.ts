import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

type AuthStateCallback = (event: AuthChangeEvent, session: Session | null) => void;

function makeMockSupabase(overrides: Partial<{
  signInWithOAuth: (opts: any) => Promise<any>;
  signOut: () => Promise<any>;
}> = {}) {
  let authCallback: AuthStateCallback | null = null;
  const supabase = {
    auth: {
      onAuthStateChange: (cb: AuthStateCallback) => {
        authCallback = cb;
        cb('INITIAL_SESSION', null);
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signInWithOAuth: overrides.signInWithOAuth ?? (() => Promise.resolve({ data: {}, error: null })),
      signOut: overrides.signOut ?? (() => Promise.resolve({ error: null })),
    },
    _triggerAuthChange: (event: AuthChangeEvent, session: Session | null) => {
      authCallback?.(event, session);
    },
  };
  return { getSupabase: () => supabase as any, _supabase: supabase };
}

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;
  let mockSupabaseWrapper: ReturnType<typeof makeMockSupabase>;

  const setup = (supabaseOverrides?: Parameters<typeof makeMockSupabase>[0]) => {
    mockSupabaseWrapper = makeMockSupabase(supabaseOverrides);
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthService,
        { provide: SupabaseService, useValue: mockSupabaseWrapper },
      ],
    });
    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  };

  it('should be created', () => {
    setup();
    expect(service).toBeTruthy();
  });

  // ── session$ / isLoaded$ ──────────────────────────────────────────────────

  describe('session$', () => {
    it('emits null initially (INITIAL_SESSION with no session)', (done) => {
      setup();
      service.session$.subscribe(s => {
        expect(s).toBeNull();
        done();
      });
    });

    it('emits the session when auth state changes to SIGNED_IN', (done) => {
      setup();
      const fakeSession = { user: { id: 'u1' } } as Session;
      let count = 0;
      service.session$.subscribe(s => {
        count++;
        if (count === 2) {
          expect(s).toBe(fakeSession);
          done();
        }
      });
      mockSupabaseWrapper._supabase._triggerAuthChange('SIGNED_IN', fakeSession);
    });
  });

  describe('isLoaded$', () => {
    it('emits true after INITIAL_SESSION fires', (done) => {
      setup();
      service.isLoaded$.subscribe(loaded => {
        expect(loaded).toBeTrue();
        done();
      });
    });
  });

  // ── signInWithGoogle ──────────────────────────────────────────────────────

  describe('signInWithGoogle', () => {
    it('calls signInWithOAuth with google provider', async () => {
      const spy = jasmine.createSpy().and.returnValue(Promise.resolve({ data: {}, error: null }));
      setup({ signInWithOAuth: spy });
      await service.signInWithGoogle();
      expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({ provider: 'google' }));
    });

    it('includes /auth/callback in the redirectTo', async () => {
      const spy = jasmine.createSpy().and.returnValue(Promise.resolve({ data: {}, error: null }));
      setup({ signInWithOAuth: spy });
      await service.signInWithGoogle();
      const opts = spy.calls.mostRecent().args[0];
      expect(opts.options.redirectTo).toContain('/auth/callback');
    });

    it('throws when supabase returns an error', async () => {
      const err = { message: 'Provider not enabled' };
      setup({ signInWithOAuth: () => Promise.resolve({ data: {}, error: err as any }) });
      await expectAsync(service.signInWithGoogle()).toBeRejectedWith(err as any);
    });
  });

  // ── signInWithGitHub ──────────────────────────────────────────────────────

  describe('signInWithGitHub', () => {
    it('calls signInWithOAuth with github provider', async () => {
      const spy = jasmine.createSpy().and.returnValue(Promise.resolve({ data: {}, error: null }));
      setup({ signInWithOAuth: spy });
      await service.signInWithGitHub();
      expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({ provider: 'github' }));
    });

    it('throws when supabase returns an error', async () => {
      const err = { message: 'Provider not enabled' };
      setup({ signInWithOAuth: () => Promise.resolve({ data: {}, error: err as any }) });
      await expectAsync(service.signInWithGitHub()).toBeRejectedWith(err as any);
    });
  });

  // ── signOut ───────────────────────────────────────────────────────────────

  describe('signOut', () => {
    it('calls supabase.auth.signOut', async () => {
      const spy = jasmine.createSpy().and.returnValue(Promise.resolve({ error: null }));
      setup({ signOut: spy });
      await service.signOut();
      expect(spy).toHaveBeenCalled();
    });

    it('navigates to / when SIGNED_OUT event fires', fakeAsync(() => {
      setup();
      const navigateSpy = spyOn(router, 'navigate');
      mockSupabaseWrapper._supabase._triggerAuthChange('SIGNED_OUT', null);
      tick();
      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    }));
  });
});
