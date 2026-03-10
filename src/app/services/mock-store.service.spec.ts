import { TestBed } from '@angular/core/testing';
import { MockStoreService } from './mock-store.service';
import { AuthService } from './auth.service';
import { MockAuthService } from './auth.service.mock';

const STORAGE_KEY = 'mockapi_endpoints';

const makeEndpoint = (overrides = {}) => ({
  id: 'test-id-1',
  name: 'Test Endpoint',
  method: 'GET' as const,
  path: '/api/test',
  statusCode: 200,
  responseBody: '{"ok":true}',
  delay: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
  isActive: true,
  ...overrides,
});

const providers = [MockStoreService, { provide: AuthService, useClass: MockAuthService }];

describe('MockStoreService', () => {
  let service: MockStoreService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers });
    service = TestBed.inject(MockStoreService);
  });

  afterEach(() => localStorage.clear());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── getEndpoints ──────────────────────────────────────────────────────────

  describe('getEndpoints', () => {
    it('returns empty array when storage is empty', () => {
      expect(service.getEndpoints()).toEqual([]);
    });

    it('returns endpoints stored in localStorage', () => {
      const ep = makeEndpoint();
      localStorage.setItem(STORAGE_KEY, JSON.stringify([ep]));
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers });
      service = TestBed.inject(MockStoreService);
      expect(service.getEndpoints()).toEqual([ep]);
    });

    it('returns cached result on subsequent calls', () => {
      const getSpy = spyOn(localStorage, 'getItem').and.callThrough();
      service.getEndpoints();
      service.getEndpoints();
      expect(getSpy).toHaveBeenCalledTimes(1);
    });

    it('returns empty array when localStorage throws', () => {
      spyOn(localStorage, 'getItem').and.throwError('QuotaExceededError');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers });
      service = TestBed.inject(MockStoreService);
      expect(service.getEndpoints()).toEqual([]);
    });
  });

  // ── addEndpoint ───────────────────────────────────────────────────────────

  describe('addEndpoint', () => {
    it('returns new endpoint with generated id and createdAt', () => {
      const result = service.addEndpoint({
        name: 'My EP',
        method: 'POST',
        path: '/api/users',
        statusCode: 201,
        responseBody: '{}',
        delay: 0,
      });
      expect(result.id).toBeTruthy();
      expect(result.createdAt).toBeTruthy();
      expect(result.isActive).toBeTrue();
      expect(result.name).toBe('My EP');
    });

    it('persists the endpoint to localStorage', () => {
      service.addEndpoint({
        name: 'My EP',
        method: 'GET',
        path: '/api/v1/items',
        statusCode: 200,
        responseBody: '[]',
        delay: 0,
      });
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored.length).toBe(1);
      expect(stored[0].name).toBe('My EP');
    });

    it('appends to existing endpoints', () => {
      service.addEndpoint({
        name: 'EP1',
        method: 'GET',
        path: '/a',
        statusCode: 200,
        responseBody: '{}',
        delay: 0,
      });
      service.addEndpoint({
        name: 'EP2',
        method: 'POST',
        path: '/b',
        statusCode: 201,
        responseBody: '{}',
        delay: 0,
      });
      expect(service.getEndpoints().length).toBe(2);
    });

    it('generates unique ids', () => {
      const a = service.addEndpoint({
        name: 'A',
        method: 'GET',
        path: '/a',
        statusCode: 200,
        responseBody: '{}',
        delay: 0,
      });
      const b = service.addEndpoint({
        name: 'B',
        method: 'GET',
        path: '/b',
        statusCode: 200,
        responseBody: '{}',
        delay: 0,
      });
      expect(a.id).not.toBe(b.id);
    });
  });

  // ── deleteEndpoint ────────────────────────────────────────────────────────

  describe('deleteEndpoint', () => {
    it('removes the endpoint with the given id', () => {
      const ep = service.addEndpoint({
        name: 'To Delete',
        method: 'DELETE',
        path: '/x',
        statusCode: 200,
        responseBody: '{}',
        delay: 0,
      });
      service.deleteEndpoint(ep.id);
      expect(service.getEndpoints().find((e) => e.id === ep.id)).toBeUndefined();
    });

    it('leaves other endpoints intact', () => {
      const a = service.addEndpoint({
        name: 'A',
        method: 'GET',
        path: '/a',
        statusCode: 200,
        responseBody: '{}',
        delay: 0,
      });
      const b = service.addEndpoint({
        name: 'B',
        method: 'GET',
        path: '/b',
        statusCode: 200,
        responseBody: '{}',
        delay: 0,
      });
      service.deleteEndpoint(a.id);
      const remaining = service.getEndpoints();
      expect(remaining.length).toBe(1);
      expect(remaining[0].id).toBe(b.id);
    });

    it('does nothing when id does not exist', () => {
      service.addEndpoint({
        name: 'A',
        method: 'GET',
        path: '/a',
        statusCode: 200,
        responseBody: '{}',
        delay: 0,
      });
      service.deleteEndpoint('non-existent-id');
      expect(service.getEndpoints().length).toBe(1);
    });
  });

  // ── toggleEndpoint ────────────────────────────────────────────────────────

  describe('toggleEndpoint', () => {
    it('sets isActive from true to false', () => {
      const ep = service.addEndpoint({
        name: 'A',
        method: 'GET',
        path: '/a',
        statusCode: 200,
        responseBody: '{}',
        delay: 0,
      });
      expect(ep.isActive).toBeTrue();
      service.toggleEndpoint(ep.id);
      expect(service.getEndpoints()[0].isActive).toBeFalse();
    });

    it('sets isActive from false to true', () => {
      const ep = service.addEndpoint({
        name: 'A',
        method: 'GET',
        path: '/a',
        statusCode: 200,
        responseBody: '{}',
        delay: 0,
      });
      service.toggleEndpoint(ep.id);
      service.toggleEndpoint(ep.id);
      expect(service.getEndpoints()[0].isActive).toBeTrue();
    });
  });

  // ── updateEndpoint ────────────────────────────────────────────────────────

  describe('updateEndpoint', () => {
    it('updates only the specified fields', () => {
      const ep = service.addEndpoint({
        name: 'Original',
        method: 'GET',
        path: '/orig',
        statusCode: 200,
        responseBody: '{}',
        delay: 0,
      });
      service.updateEndpoint(ep.id, { name: 'Updated', statusCode: 404 });
      const updated = service.getEndpoints()[0];
      expect(updated.name).toBe('Updated');
      expect(updated.statusCode).toBe(404);
      expect(updated.path).toBe('/orig');
    });

    it('does not modify other endpoints', () => {
      const a = service.addEndpoint({
        name: 'A',
        method: 'GET',
        path: '/a',
        statusCode: 200,
        responseBody: '{}',
        delay: 0,
      });
      const b = service.addEndpoint({
        name: 'B',
        method: 'GET',
        path: '/b',
        statusCode: 200,
        responseBody: '{}',
        delay: 0,
      });
      service.updateEndpoint(a.id, { name: 'A Updated' });
      const bAfter = service.getEndpoints().find((e) => e.id === b.id)!;
      expect(bAfter.name).toBe('B');
    });
  });

  // ── localStorage error handling ───────────────────────────────────────────

  describe('localStorage error handling', () => {
    it('does not throw when localStorage.setItem fails', () => {
      spyOn(localStorage, 'setItem').and.throwError('QuotaExceededError');
      expect(() => {
        service.addEndpoint({
          name: 'A',
          method: 'GET',
          path: '/a',
          statusCode: 200,
          responseBody: '{}',
          delay: 0,
        });
      }).not.toThrow();
    });
  });

  // ── user-scoped storage ───────────────────────────────────────────────────

  describe('user-scoped storage', () => {
    it('uses the base storage key when no user is logged in', () => {
      const setSpy = spyOn(localStorage, 'setItem').and.callThrough();
      service.addEndpoint({
        name: 'A',
        method: 'GET',
        path: '/a',
        statusCode: 200,
        responseBody: '{}',
        delay: 0,
      });
      expect(setSpy).toHaveBeenCalledWith(STORAGE_KEY, jasmine.any(String));
    });

    it('uses a user-scoped key when a user is logged in', () => {
      const mockAuth = TestBed.inject(AuthService) as unknown as MockAuthService;
      mockAuth.setSession({ user: { id: 'user-abc' } } as any);

      // Reset cache so the new key is picked up
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers });
      service = TestBed.inject(MockStoreService);
      (TestBed.inject(AuthService) as unknown as MockAuthService).setSession({
        user: { id: 'user-abc' },
      } as any);

      const setSpy = spyOn(localStorage, 'setItem').and.callThrough();
      service.addEndpoint({
        name: 'B',
        method: 'GET',
        path: '/b',
        statusCode: 200,
        responseBody: '{}',
        delay: 0,
      });
      expect(setSpy).toHaveBeenCalledWith(`${STORAGE_KEY}_user-abc`, jasmine.any(String));
    });

    it('resets cache when auth state changes', () => {
      service.addEndpoint({
        name: 'A',
        method: 'GET',
        path: '/a',
        statusCode: 200,
        responseBody: '{}',
        delay: 0,
      });

      // Trigger auth state change (simulates login/logout)
      const mockAuth = TestBed.inject(AuthService) as unknown as MockAuthService;
      mockAuth.setSession(null);

      // Cache should have been cleared — localStorage is read again
      const getSpy = spyOn(localStorage, 'getItem').and.callThrough();
      service.getEndpoints();
      expect(getSpy).toHaveBeenCalledTimes(1);
    });
  });
});
