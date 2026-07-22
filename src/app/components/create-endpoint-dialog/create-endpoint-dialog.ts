import { Component, ChangeDetectionStrategy, EventEmitter, Input, Output } from '@angular/core';
import { HttpMethod, MockStoreService } from '../../services/mock-store.service';

@Component({
  selector: 'app-create-endpoint-dialog',
  standalone: false,
  templateUrl: './create-endpoint-dialog.html',
  styleUrl: './create-endpoint-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEndpointDialogComponent {
  @Input() disabled = false;
  @Output() created = new EventEmitter<void>();

  isOpen = false;
  name = '';
  method: HttpMethod = 'GET';
  path = '/api/v1/';
  statusCode = 200;
  delay = 0;
  responseBody = `{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "status": "active"
}`;
  responseHeaders = '';
  webhookUrl = '';
  showAdvanced = false;
  error: string | null = null;
  methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  templates = [
    { name: 'User', body: '{\n  "id": 1,\n  "name": "John Doe",\n  "email": "john@example.com",\n  "status": "active"\n}' },
    { name: 'Product', body: '{\n  "id": 101,\n  "name": "Widget Pro",\n  "price": 29.99,\n  "currency": "USD",\n  "inStock": true\n}' },
    { name: 'List', body: '[\n  { "id": 1, "name": "Item 1" },\n  { "id": 2, "name": "Item 2" },\n  { "id": 3, "name": "Item 3" }\n]' },
    { name: 'Error', body: '{\n  "error": "Not Found",\n  "message": "The requested resource was not found",\n  "code": 404\n}' },
    { name: 'Success', body: '{\n  "success": true,\n  "message": "Operation completed successfully"\n}' },
  ];

  applyTemplate(template: { name: string; body: string }): void {
    this.responseBody = template.body;
  }

  constructor(private mockStore: MockStoreService) {}

  open(): void {
    if (this.disabled) return;
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
    this.error = null;
    this.resetForm();
  }

  async create(): Promise<void> {
    if (!this.name.trim() || !this.path.trim()) {
      this.error = 'Name and path are required';
      return;
    }

    if (!this.path.startsWith('/')) {
      this.error = 'Path must start with /';
      return;
    }

    if (this.statusCode < 100 || this.statusCode > 599) {
      this.error = 'Status code must be between 100 and 599';
      return;
    }

    if (this.delay < 0 || this.delay > 30000) {
      this.error = 'Delay must be between 0 and 30000ms';
      return;
    }

    try {
      JSON.parse(this.responseBody);
    } catch {
      this.error = 'Response body must be valid JSON';
      return;
    }

    let headers: Record<string, string> = {};
    if (this.responseHeaders.trim()) {
      try {
        headers = JSON.parse(this.responseHeaders);
      } catch {
        this.error = 'Response headers must be valid JSON';
        return;
      }
    }

    const result = await this.mockStore.addEndpoint({
      name: this.name,
      method: this.method,
      path: this.path,
      statusCode: this.statusCode,
      responseBody: this.responseBody,
      responseHeaders: headers,
      webhookUrl: this.webhookUrl.trim() || null,
      sharedWith: [],
      delay: this.delay,
    });

    if (result) {
      this.created.emit();
      this.isOpen = false;
      this.error = null;
      this.resetForm();
    } else {
      this.error = 'Failed to create endpoint. Please try again.';
    }
  }

  private resetForm(): void {
    this.name = '';
    this.method = 'GET';
    this.path = '/api/v1/';
    this.statusCode = 200;
    this.delay = 0;
    this.responseBody = `{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "status": "active"
}`;
    this.responseHeaders = '';
    this.webhookUrl = '';
    this.showAdvanced = false;
  }
}
