import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
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

interface DbEndpoint {
  id: string;
  user_id: string;
  name: string;
  method: string;
  path: string;
  status_code: number;
  response_body: string;
  delay: number;
  is_active: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class MockStoreService {
  private _endpoints = new BehaviorSubject<MockEndpoint[]>([]);
  private _loading = new BehaviorSubject<boolean>(false);
  private _error = new BehaviorSubject<string | null>(null);

  public endpoints$ = this._endpoints.asObservable();
  public loading$ = this._loading.asObservable();
  public error$ = this._error.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService,
  ) {
    // Reload endpoints when auth state changes
    this.authService.session$.subscribe((session) => {
      if (session) {
        this.loadEndpoints();
      } else {
        this._endpoints.next([]);
      }
    });
  }

  private get supabase() {
    return this.supabaseService.getSupabase();
  }

  private mapDbToEndpoint(db: DbEndpoint): MockEndpoint {
    return {
      id: db.id,
      name: db.name,
      method: db.method as HttpMethod,
      path: db.path,
      statusCode: db.status_code,
      responseBody: typeof db.response_body === 'string'
        ? db.response_body
        : JSON.stringify(db.response_body, null, 2),
      delay: db.delay,
      createdAt: db.created_at,
      isActive: db.is_active,
    };
  }

  async loadEndpoints(): Promise<void> {
    this._loading.next(true);
    this._error.next(null);

    try {
      const { data, error } = await this.supabase
        .from('endpoints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const endpoints = (data || []).map((d: DbEndpoint) => this.mapDbToEndpoint(d));
      this._endpoints.next(endpoints);
    } catch (err) {
      console.error('Failed to load endpoints:', err);
      this._error.next('Failed to load endpoints');
    } finally {
      this._loading.next(false);
    }
  }

  getEndpoints(): MockEndpoint[] {
    return this._endpoints.getValue();
  }

  async addEndpoint(
    endpoint: Omit<MockEndpoint, 'id' | 'createdAt' | 'isActive'>,
  ): Promise<MockEndpoint | null> {
    const userId = this.authService.currentSession?.user?.id;
    if (!userId) {
      this._error.next('Not authenticated');
      return null;
    }

    this._loading.next(true);
    this._error.next(null);

    try {
      // Parse responseBody to ensure it's valid JSON for storage
      let responseBodyJson: unknown;
      try {
        responseBodyJson = JSON.parse(endpoint.responseBody);
      } catch {
        // If not valid JSON, store as string
        responseBodyJson = endpoint.responseBody;
      }

      const { data, error } = await this.supabase
        .from('endpoints')
        .insert({
          user_id: userId,
          name: endpoint.name,
          method: endpoint.method,
          path: endpoint.path,
          status_code: endpoint.statusCode,
          response_body: responseBodyJson,
          delay: endpoint.delay,
        })
        .select()
        .single();

      if (error) throw error;

      const newEndpoint = this.mapDbToEndpoint(data);
      this._endpoints.next([newEndpoint, ...this._endpoints.getValue()]);
      return newEndpoint;
    } catch (err) {
      console.error('Failed to create endpoint:', err);
      this._error.next('Failed to create endpoint');
      return null;
    } finally {
      this._loading.next(false);
    }
  }

  async deleteEndpoint(id: string): Promise<void> {
    this._error.next(null);

    try {
      const { error } = await this.supabase
        .from('endpoints')
        .delete()
        .eq('id', id);

      if (error) throw error;

      this._endpoints.next(this._endpoints.getValue().filter((e) => e.id !== id));
    } catch (err) {
      console.error('Failed to delete endpoint:', err);
      this._error.next('Failed to delete endpoint');
    }
  }

  async toggleEndpoint(id: string): Promise<void> {
    this._error.next(null);
    const endpoint = this._endpoints.getValue().find((e) => e.id === id);
    if (!endpoint) return;

    try {
      const { error } = await this.supabase
        .from('endpoints')
        .update({ is_active: !endpoint.isActive })
        .eq('id', id);

      if (error) throw error;

      this._endpoints.next(
        this._endpoints.getValue().map((e) =>
          e.id === id ? { ...e, isActive: !e.isActive } : e,
        ),
      );
    } catch (err) {
      console.error('Failed to toggle endpoint:', err);
      this._error.next('Failed to toggle endpoint');
    }
  }

  async updateEndpoint(id: string, updates: Partial<MockEndpoint>): Promise<void> {
    this._error.next(null);

    try {
      const dbUpdates: Partial<{
        name: string;
        method: string;
        path: string;
        status_code: number;
        delay: number;
        is_active: boolean;
        response_body: unknown;
      }> = {};

      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.method !== undefined) dbUpdates.method = updates.method;
      if (updates.path !== undefined) dbUpdates.path = updates.path;
      if (updates.statusCode !== undefined) dbUpdates.status_code = updates.statusCode;
      if (updates.delay !== undefined) dbUpdates.delay = updates.delay;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
      if (updates.responseBody !== undefined) {
        try {
          dbUpdates.response_body = JSON.parse(updates.responseBody);
        } catch {
          dbUpdates.response_body = updates.responseBody;
        }
      }

      const { error } = await this.supabase
        .from('endpoints')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      this._endpoints.next(
        this._endpoints.getValue().map((e) => (e.id === id ? { ...e, ...updates } : e)),
      );
    } catch (err) {
      console.error('Failed to update endpoint:', err);
      this._error.next('Failed to update endpoint');
    }
  }
}
