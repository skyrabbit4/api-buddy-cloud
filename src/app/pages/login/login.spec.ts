import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { LoginComponent } from './login';
import { AuthService } from '../../services/auth.service';
import { MockAuthService } from '../../services/auth.service.mock';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [RouterTestingModule],
      providers: [{ provide: AuthService, useClass: MockAuthService }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('has no error on init', () => {
    expect(component.error).toBeNull();
  });

  // ── loginWithGoogle ───────────────────────────────────────────────────────

  describe('loginWithGoogle', () => {
    it('calls authService.signInWithGoogle', async () => {
      const spy = spyOn(authService, 'signInWithGoogle').and.returnValue(Promise.resolve());
      await component.loginWithGoogle();
      expect(spy).toHaveBeenCalled();
    });

    it('clears any previous error before attempting', async () => {
      component.error = 'old error';
      spyOn(authService, 'signInWithGoogle').and.returnValue(Promise.resolve());
      await component.loginWithGoogle();
      expect(component.error).toBeNull();
    });

    it('sets error message when signInWithGoogle throws an Error', async () => {
      spyOn(authService, 'signInWithGoogle').and.returnValue(Promise.reject(new Error('Provider not configured')));
      await component.loginWithGoogle();
      expect(component.error).toBe('Provider not configured');
    });

    it('sets fallback message when signInWithGoogle throws a non-Error', async () => {
      spyOn(authService, 'signInWithGoogle').and.returnValue(Promise.reject('unknown'));
      await component.loginWithGoogle();
      expect(component.error).toBe('Failed to sign in with Google');
    });
  });

  // ── loginWithGitHub ───────────────────────────────────────────────────────

  describe('loginWithGitHub', () => {
    it('calls authService.signInWithGitHub', async () => {
      const spy = spyOn(authService, 'signInWithGitHub').and.returnValue(Promise.resolve());
      await component.loginWithGitHub();
      expect(spy).toHaveBeenCalled();
    });

    it('clears any previous error before attempting', async () => {
      component.error = 'old error';
      spyOn(authService, 'signInWithGitHub').and.returnValue(Promise.resolve());
      await component.loginWithGitHub();
      expect(component.error).toBeNull();
    });

    it('sets error message when signInWithGitHub throws an Error', async () => {
      spyOn(authService, 'signInWithGitHub').and.returnValue(Promise.reject(new Error('OAuth error')));
      await component.loginWithGitHub();
      expect(component.error).toBe('OAuth error');
    });

    it('sets fallback message when signInWithGitHub throws a non-Error', async () => {
      spyOn(authService, 'signInWithGitHub').and.returnValue(Promise.reject(null));
      await component.loginWithGitHub();
      expect(component.error).toBe('Failed to sign in with GitHub');
    });
  });
});
