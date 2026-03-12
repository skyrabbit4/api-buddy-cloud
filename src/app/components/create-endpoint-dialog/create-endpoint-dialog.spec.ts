import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { CreateEndpointDialogComponent } from './create-endpoint-dialog';
import { MockStoreService } from '../../services/mock-store.service';

describe('CreateEndpointDialogComponent', () => {
  let component: CreateEndpointDialogComponent;
  let fixture: ComponentFixture<CreateEndpointDialogComponent>;
  let mockStore: jasmine.SpyObj<MockStoreService>;

  beforeEach(async () => {
    mockStore = jasmine.createSpyObj('MockStoreService', ['addEndpoint']);
    mockStore.addEndpoint.and.returnValue(Promise.resolve({
      id: 'new-id',
      name: 'Test',
      method: 'GET',
      path: '/api/test',
      statusCode: 200,
      responseBody: '{}',
      delay: 0,
      createdAt: new Date().toISOString(),
      isActive: true,
    }));

    await TestBed.configureTestingModule({
      declarations: [CreateEndpointDialogComponent],
      imports: [FormsModule],
      providers: [{ provide: MockStoreService, useValue: mockStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEndpointDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── open / close ──────────────────────────────────────────────────────────

  describe('open', () => {
    it('sets isOpen to true', () => {
      component.open();
      expect(component.isOpen).toBeTrue();
    });
  });

  describe('close', () => {
    it('sets isOpen to false', () => {
      component.open();
      component.close();
      expect(component.isOpen).toBeFalse();
    });

    it('clears error', () => {
      component.error = 'some error';
      component.close();
      expect(component.error).toBeNull();
    });
  });

  // ── create – validation ───────────────────────────────────────────────────

  describe('create – validation', () => {
    beforeEach(() => {
      component.name = 'My Endpoint';
      component.path = '/api/v1/users';
      component.statusCode = 200;
      component.delay = 0;
      component.responseBody = '{"ok":true}';
    });

    it('shows error when name is empty', () => {
      component.name = '';
      component.create();
      expect(component.error).toBe('Name and path are required');
      expect(mockStore.addEndpoint).not.toHaveBeenCalled();
    });

    it('shows error when name is only whitespace', () => {
      component.name = '   ';
      component.create();
      expect(component.error).toBe('Name and path are required');
    });

    it('shows error when path is empty', () => {
      component.path = '';
      component.create();
      expect(component.error).toBe('Name and path are required');
    });

    it('shows error when path does not start with /', () => {
      component.path = 'api/v1/users';
      component.create();
      expect(component.error).toBe('Path must start with /');
    });

    it('shows error when statusCode is below 100', () => {
      component.statusCode = 99;
      component.create();
      expect(component.error).toBe('Status code must be between 100 and 599');
    });

    it('shows error when statusCode is above 599', () => {
      component.statusCode = 600;
      component.create();
      expect(component.error).toBe('Status code must be between 100 and 599');
    });

    it('shows error when delay is negative', () => {
      component.delay = -1;
      component.create();
      expect(component.error).toBe('Delay must be between 0 and 30000ms');
    });

    it('shows error when delay exceeds 30000', () => {
      component.delay = 30001;
      component.create();
      expect(component.error).toBe('Delay must be between 0 and 30000ms');
    });

    it('shows error when responseBody is invalid JSON', () => {
      component.responseBody = '{ invalid json }';
      component.create();
      expect(component.error).toBe('Response body must be valid JSON');
    });
  });

  // ── create – success ──────────────────────────────────────────────────────

  describe('create – success', () => {
    beforeEach(() => {
      component.name = 'Get Users';
      component.path = '/api/v1/users';
      component.method = 'GET';
      component.statusCode = 200;
      component.delay = 100;
      component.responseBody = '{"users":[]}';
      component.isOpen = true;
    });

    it('calls mockStore.addEndpoint with correct values', () => {
      component.create();
      expect(mockStore.addEndpoint).toHaveBeenCalledWith({
        name: 'Get Users',
        method: 'GET',
        path: '/api/v1/users',
        statusCode: 200,
        responseBody: '{"users":[]}',
        delay: 100,
      });
    });

    it('emits the created event', () => {
      let emitted = false;
      component.created.subscribe(() => (emitted = true));
      component.create();
      expect(emitted).toBeTrue();
    });

    it('closes the dialog', () => {
      component.create();
      expect(component.isOpen).toBeFalse();
    });

    it('resets the form after creation', () => {
      component.create();
      expect(component.name).toBe('');
      expect(component.method).toBe('GET');
      expect(component.path).toBe('/api/v1/');
      expect(component.statusCode).toBe(200);
      expect(component.delay).toBe(0);
    });

    it('clears error on successful creation', () => {
      component.error = 'previous error';
      component.create();
      expect(component.error).toBeNull();
    });
  });
});
