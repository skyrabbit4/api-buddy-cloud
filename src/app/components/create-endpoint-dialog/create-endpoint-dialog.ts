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
  error: string | null = null;
  methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

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

    const result = await this.mockStore.addEndpoint({
      name: this.name,
      method: this.method,
      path: this.path,
      statusCode: this.statusCode,
      responseBody: this.responseBody,
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
  }
}
