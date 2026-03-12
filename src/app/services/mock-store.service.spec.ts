import { TestBed } from '@angular/core/testing';
import { MockStoreService } from './mock-store.service';
import { AuthService } from './auth.service';
import { MockAuthService } from './auth.service.mock';
import { SupabaseService } from './supabase.service';

// Creates a chainable Supabase query builder that resolves to `result`
function queryOf(result: { data?: any; error?: any }) {
  const q: any = {
    select: () => q,
    insert: () => q,
    update: () => q,
    delete: () => q,
    order: () => q,
    eq: () => q,
    single: () => Promise.resolve(result),
    then: (res: any, rej: any) => Promise.resolve(result).then(res, rej),
    catch: (fn: any) => Promise.resolve(result).catch(fn),
    finally: (fn: any) => Promise.resolve(result).finally(fn),
  };
  return q;
}

const makeDbEndpoint = (overrides: any = {}) => ({
  id: 'test-id-1',
  user_id: 'user-1',
  name: 'Test Endpoint',
  method: 'GET',
  path: '/api/test',
  status_code: 200,
  response_body: '{"ok":true}',
  delay: 0,
  created_at: '2024-01-01T00:00:00.000Z',
  is_active: true,
  ...overrides,
});

const SESSION: any = { user: { id: 'user-1' } };

describe('MockStoreService', () => {
  let service: MockStoreService;
  let mockAuth: MockAuthService;
  let fromSpy: jasmine.Spy;

  beforeEach(() => {
    const mockSupabaseClient: any = { from: () => {} };
    fromSpy = spyOn(mockSupabaseClient, 'from').and.returnValue(queryOf({ data: [], error: null }));

    TestBed.configureTestingModule({
      providers: [
        MockStoreService,
        { provide: AuthService, useClass: MockAuthService },
        { provide: SupabaseService, useValue: { getSupabase: () => mockSupabaseClient } },
      ],
    });

    service = TestBed.inject(MockStoreService);
    mockAuth = TestBed.inject(AuthService) as unknown as MockAuthService;
    // Prevent loadEndpoints from making Supabase calls on setSession
    spyOn(service, 'loadEndpoints').and.callFake(() => Promise.resolve());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── getEndpoints ──────────────────────────────────────────────────────────

  describe('getEndpoints', () => {
    it('returns empty array initially', () => {
      expect(service.getEndpoints()).toEqual([]);
    });

    it('clears endpoints when session becomes null', () => {
      (service as any)._endpoints.next([makeDbEndpoint()]);
      mockAuth.setSession(null);
      expect(service.getEndpoints()).toEqual([]);
    });
  });

  // ── loadEndpoints ─────────────────────────────────────────────────────────

  describe('loadEndpoints', () => {
    beforeEach(() => {
      (service.loadEndpoints as jasmine.Spy).and.callThrough();
    });

    it('populates endpoints from Supabase', async () => {
      fromSpy.and.returnValue(queryOf({ data: [makeDbEndpoint()], error: null }));
      await service.loadEndpoints();
      expect(service.getEndpoints().length).toBe(1);
      expect(service.getEndpoints()[0].id).toBe('test-id-1');
    });

    it('maps DB fields to MockEndpoint fields', async () => {
      fromSpy.and.returnValue(queryOf({
        data: [makeDbEndpoint({ name: 'My EP', status_code: 201, is_active: false })],
        error: null,
      }));
      await service.loadEndpoints();
      const ep = service.getEndpoints()[0];
      expect(ep.name).toBe('My EP');
      expect(ep.statusCode).toBe(201);
      expect(ep.isActive).toBeFalse();
    });

    it('keeps endpoints empty on Supabase error', async () => {
      fromSpy.and.returnValue(queryOf({ data: null, error: new Error('DB error') }));
      await service.loadEndpoints();
      expect(service.getEndpoints()).toEqual([]);
    });
  });

  // ── addEndpoint ───────────────────────────────────────────────────────────

  describe('addEndpoint', () => {
    beforeEach(() => {
      mockAuth.setSession(SESSION);
    });

    it('returns new endpoint with id, createdAt, isActive, name', async () => {
      const dbEp = makeDbEndpoint({ name: 'My EP' });
      fromSpy.and.returnValue(queryOf({ data: dbEp, error: null }));
      const result = await service.addEndpoint({
        name: 'My EP',
        method: 'POST',
        path: '/api/users',
        statusCode: 201,
        responseBody: '{}',
        delay: 0,
      });
      expect(result?.id).toBeTruthy();
      expect(result?.createdAt).toBeTruthy();
      expect(result?.isActive).toBeTrue();
      expect(result?.name).toBe('My EP');
    });

    it('returns null when not authenticated', async () => {
      mockAuth.setSession(null);
      const result = await service.addEndpoint({
        name: 'A', method: 'GET', path: '/a', statusCode: 200, responseBody: '{}', delay: 0,
      });
      expect(result).toBeNull();
    });

    it('appends endpoint to the list', async () => {
      fromSpy.and.returnValue(queryOf({ data: makeDbEndpoint(), error: null }));
      await service.addEndpoint({
        name: 'EP1', method: 'GET', path: '/a', statusCode: 200, responseBody: '{}', delay: 0,
      });
      expect(service.getEndpoints().length).toBe(1);
    });

    it('generates unique ids', async () => {
      fromSpy.and.returnValues(
        queryOf({ data: makeDbEndpoint({ id: 'id-1' }), error: null }),
        queryOf({ data: makeDbEndpoint({ id: 'id-2' }), error: null }),
      );
      const a = await service.addEndpoint({ name: 'A', method: 'GET', path: '/a', statusCode: 200, responseBody: '{}', delay: 0 });
      const b = await service.addEndpoint({ name: 'B', method: 'GET', path: '/b', statusCode: 200, responseBody: '{}', delay: 0 });
      expect(a?.id).not.toBe(b?.id);
    });

    it('returns null on Supabase error', async () => {
      fromSpy.and.returnValue(queryOf({ data: null, error: new Error('DB error') }));
      const result = await service.addEndpoint({
        name: 'A', method: 'GET', path: '/a', statusCode: 200, responseBody: '{}', delay: 0,
      });
      expect(result).toBeNull();
    });
  });

  // ── deleteEndpoint ────────────────────────────────────────────────────────

  describe('deleteEndpoint', () => {
    beforeEach(() => {
      mockAuth.setSession(SESSION);
    });

    it('removes the endpoint with the given id', async () => {
      (service as any)._endpoints.next([
        { id: 'ep-to-delete', name: 'X', method: 'GET', path: '/x', statusCode: 200, responseBody: '{}', delay: 0, createdAt: '', isActive: true },
      ]);
      fromSpy.and.returnValue(queryOf({ data: null, error: null }));
      await service.deleteEndpoint('ep-to-delete');
      expect(service.getEndpoints().find(e => e.id === 'ep-to-delete')).toBeUndefined();
    });

    it('leaves other endpoints intact', async () => {
      (service as any)._endpoints.next([
        { id: 'id-a', name: 'A', method: 'GET', path: '/a', statusCode: 200, responseBody: '{}', delay: 0, createdAt: '', isActive: true },
        { id: 'id-b', name: 'B', method: 'GET', path: '/b', statusCode: 200, responseBody: '{}', delay: 0, createdAt: '', isActive: true },
      ]);
      fromSpy.and.returnValue(queryOf({ data: null, error: null }));
      await service.deleteEndpoint('id-a');
      const remaining = service.getEndpoints();
      expect(remaining.length).toBe(1);
      expect(remaining[0].id).toBe('id-b');
    });

    it('does nothing when id does not exist', async () => {
      (service as any)._endpoints.next([
        { id: 'id-a', name: 'A', method: 'GET', path: '/a', statusCode: 200, responseBody: '{}', delay: 0, createdAt: '', isActive: true },
      ]);
      fromSpy.and.returnValue(queryOf({ data: null, error: null }));
      await service.deleteEndpoint('non-existent');
      expect(service.getEndpoints().length).toBe(1);
    });
  });

  // ── toggleEndpoint ────────────────────────────────────────────────────────

  describe('toggleEndpoint', () => {
    beforeEach(() => {
      mockAuth.setSession(SESSION);
    });

    it('sets isActive from true to false', async () => {
      (service as any)._endpoints.next([
        { id: 'ep-1', name: 'A', method: 'GET', path: '/a', statusCode: 200, responseBody: '{}', delay: 0, createdAt: '', isActive: true },
      ]);
      fromSpy.and.returnValue(queryOf({ data: null, error: null }));
      await service.toggleEndpoint('ep-1');
      expect(service.getEndpoints()[0].isActive).toBeFalse();
    });

    it('sets isActive from false to true', async () => {
      (service as any)._endpoints.next([
        { id: 'ep-1', name: 'A', method: 'GET', path: '/a', statusCode: 200, responseBody: '{}', delay: 0, createdAt: '', isActive: false },
      ]);
      fromSpy.and.returnValue(queryOf({ data: null, error: null }));
      await service.toggleEndpoint('ep-1');
      expect(service.getEndpoints()[0].isActive).toBeTrue();
    });
  });

  // ── updateEndpoint ────────────────────────────────────────────────────────

  describe('updateEndpoint', () => {
    beforeEach(() => {
      mockAuth.setSession(SESSION);
    });

    it('updates only the specified fields', async () => {
      (service as any)._endpoints.next([
        { id: 'ep-1', name: 'Original', method: 'GET', path: '/orig', statusCode: 200, responseBody: '{}', delay: 0, createdAt: '', isActive: true },
      ]);
      fromSpy.and.returnValue(queryOf({ data: null, error: null }));
      await service.updateEndpoint('ep-1', { name: 'Updated', statusCode: 404 });
      const updated = service.getEndpoints()[0];
      expect(updated.name).toBe('Updated');
      expect(updated.statusCode).toBe(404);
      expect(updated.path).toBe('/orig');
    });

    it('does not modify other endpoints', async () => {
      (service as any)._endpoints.next([
        { id: 'id-a', name: 'A', method: 'GET', path: '/a', statusCode: 200, responseBody: '{}', delay: 0, createdAt: '', isActive: true },
        { id: 'id-b', name: 'B', method: 'GET', path: '/b', statusCode: 200, responseBody: '{}', delay: 0, createdAt: '', isActive: true },
      ]);
      fromSpy.and.returnValue(queryOf({ data: null, error: null }));
      await service.updateEndpoint('id-a', { name: 'A Updated' });
      const bAfter = service.getEndpoints().find(e => e.id === 'id-b')!;
      expect(bAfter.name).toBe('B');
    });
  });
});
