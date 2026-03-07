import { Injectable } from '@angular/core';

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

  private generateId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  getEndpoints(): MockEndpoint[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveEndpoints(endpoints: MockEndpoint[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(endpoints));
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
      e.id === id ? { ...e, isActive: !e.isActive } : e
    );
    this.saveEndpoints(endpoints);
  }

  updateEndpoint(id: string, updates: Partial<MockEndpoint>): void {
    const endpoints = this.getEndpoints().map((e) =>
      e.id === id ? { ...e, ...updates } : e
    );
    this.saveEndpoints(endpoints);
  }
}
