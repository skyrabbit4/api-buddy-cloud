import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Session } from '@supabase/supabase-js';

import { DashboardComponent } from './dashboard';
import { ProfileMenuComponent } from '../../components/profile-menu/profile-menu';
import { CreateEndpointDialogComponent } from '../../components/create-endpoint-dialog/create-endpoint-dialog';
import { AuthService } from '../../services/auth.service';
import { MockAuthService } from '../../services/auth.service.mock';
import { MockStoreService, MockEndpoint } from '../../services/mock-store.service';

const makeSession = (overrides: Partial<{ full_name: string; name: string; email: string }> = {}): Session =>
  ({
    user: {
      id: 'user-1',
      email: overrides.email ?? 'test@example.com',
      user_metadata: {
        full_name: overrides.full_name,
        name: overrides.name,
      },
    },
  } as unknown as Session);

const makeEndpoint = (overrides: Partial<MockEndpoint> = {}): MockEndpoint => ({
  id: 'ep-1',
  name: 'Test EP',
  method: 'GET',
  path: '/api/test',
  statusCode: 200,
  responseBody: '{}',
  delay: 0,
  createdAt: '2024-01-01T00:00:00Z',
  isActive: true,
  ...overrides,
});

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: MockAuthService;
  let mockStore: jasmine.SpyObj<MockStoreService>;

  beforeEach(async () => {
    mockStore = jasmine.createSpyObj('MockStoreService', ['getEndpoints', 'addEndpoint', 'deleteEndpoint', 'toggleEndpoint']);
    mockStore.getEndpoints.and.returnValue([]);

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent, ProfileMenuComponent, CreateEndpointDialogComponent],
      imports: [FormsModule],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: MockStoreService, useValue: mockStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── greeting ──────────────────────────────────────────────────────────────

  describe('greeting', () => {
    const atHour = (h: number) => {
      spyOn(Date.prototype, 'getHours').and.returnValue(h);
    };

    it('returns "Good morning" before noon', () => {
      atHour(9);
      expect(component.greeting).toBe('Good morning');
    });

    it('returns "Good morning" at exactly midnight', () => {
      atHour(0);
      expect(component.greeting).toBe('Good morning');
    });

    it('returns "Good afternoon" at noon', () => {
      atHour(12);
      expect(component.greeting).toBe('Good afternoon');
    });

    it('returns "Good afternoon" at 17:59', () => {
      atHour(17);
      expect(component.greeting).toBe('Good afternoon');
    });

    it('returns "Good evening" at 18:00', () => {
      atHour(18);
      expect(component.greeting).toBe('Good evening');
    });

    it('returns "Good evening" at 23:00', () => {
      atHour(23);
      expect(component.greeting).toBe('Good evening');
    });
  });

  // ── firstName$ ────────────────────────────────────────────────────────────

  describe('firstName$', () => {
    it('emits first name from full_name metadata', (done) => {
      (authService as any)._session.next(makeSession({ full_name: 'Alice Smith' }));
      component.firstName$.subscribe(name => {
        if (name) {
          expect(name).toBe('Alice');
          done();
        }
      });
    });

    it('emits first name from name metadata when full_name absent', (done) => {
      (authService as any)._session.next(makeSession({ name: 'Bob Jones' }));
      component.firstName$.subscribe(name => {
        if (name) {
          expect(name).toBe('Bob');
          done();
        }
      });
    });

    it('falls back to email prefix when no name metadata', (done) => {
      (authService as any)._session.next(makeSession({ email: 'charlie@example.com' }));
      component.firstName$.subscribe(name => {
        if (name) {
          expect(name).toBe('charlie');
          done();
        }
      });
    });

    it('emits empty string when session is null', (done) => {
      (authService as any)._session.next(null);
      component.firstName$.subscribe(name => {
        expect(name).toBe('');
        done();
      });
    });
  });

  // ── ngOnInit / refresh ────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('loads endpoints from the store on init', () => {
      const endpoints = [makeEndpoint()];
      mockStore.getEndpoints.and.returnValue(endpoints);
      component.ngOnInit();
      expect(component.endpoints).toEqual(endpoints);
    });
  });

  describe('refresh', () => {
    it('reloads endpoints from the store', () => {
      mockStore.getEndpoints.and.returnValue([makeEndpoint(), makeEndpoint({ id: 'ep-2' })]);
      component.refresh();
      expect(component.endpoints.length).toBe(2);
    });
  });

  // ── signOut ───────────────────────────────────────────────────────────────

  describe('signOut', () => {
    it('calls authService.signOut', () => {
      const spy = spyOn(authService, 'signOut').and.returnValue(Promise.resolve());
      component.signOut();
      expect(spy).toHaveBeenCalled();
    });
  });
});
