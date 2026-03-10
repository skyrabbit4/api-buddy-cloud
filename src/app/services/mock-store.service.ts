import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface MockEndpoint {
  id: string;
  name: string;
  method: HttpMethod;
  path: string;
  statusCode: number;
  responseBody: string;
  delay: number;
  createdAt: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class MockStoreService {
  private readonly STORAGE_KEY = 'mockapi_endpoints';
  private cache: MockEndpoint[] | null = null;

  constructor(private authService: AuthService) {
    // Reset the in-memory cache whenever the auth state changes
    // (login, logout, token refresh) so a new user never sees
    // a previous user's endpoints.
    this.authService.session$.subscribe(() => {
      this.cache = null;
    });
  }

  private getStorageKey(): string {
    const userId = this.authService.currentSession?.user?.id;
    return userId ? `${this.STORAGE_KEY}_${userId}` : this.STORAGE_KEY;
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  getEndpoints(): MockEndpoint[] {
    if (this.cache) return this.cache;
    try {
      const data = localStorage.getItem(this.getStorageKey());
      this.cache = data ? JSON.parse(data) : [];
      return this.cache ?? [];
    } catch {
      console.warn('Failed to read from localStorage');
      return [];
    }
  }

  private saveEndpoints(endpoints: MockEndpoint[]): void {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(endpoints));
      this.cache = endpoints;
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }

  addEndpoint(endpoint: Omit<MockEndpoint, 'id' | 'createdAt' | 'isActive'>): MockEndpoint {
    const newEndpoint: MockEndpoint = {
      ...endpoint,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    const endpoints = this.getEndpoints();
    endpoints.push(newEndpoint);
    this.saveEndpoints(endpoints);
    return newEndpoint;
  }

  deleteEndpoint(id: string): void {
    const endpoints = this.getEndpoints().filter((e) => e.id !== id);
    this.saveEndpoints(endpoints);
  }

  toggleEndpoint(id: string): void {
    const endpoints = this.getEndpoints().map((e) =>
      e.id === id ? { ...e, isActive: !e.isActive } : e,
    );
    this.saveEndpoints(endpoints);
  }

  updateEndpoint(id: string, updates: Partial<MockEndpoint>): void {
    const endpoints = this.getEndpoints().map((e) => (e.id === id ? { ...e, ...updates } : e));
    this.saveEndpoints(endpoints);
  }
}
