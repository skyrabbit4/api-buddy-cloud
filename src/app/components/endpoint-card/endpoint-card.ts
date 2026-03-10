import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MockEndpoint, MockStoreService } from '../../services/mock-store.service';

@Component({
  selector: 'app-endpoint-card',
  standalone: false,
  templateUrl: './endpoint-card.html',
  styleUrl: './endpoint-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EndpointCardComponent {
  @Input() endpoint!: MockEndpoint;

  urlCopied = false;

  methodColors: Record<string, string> = {
    GET: 'method-get',
    POST: 'method-post',
    PUT: 'method-put',
    PATCH: 'method-patch',
    DELETE: 'method-delete',
  };

  methodBgColors: Record<string, string> = {
    GET: 'method-get-bg',
    POST: 'method-post-bg',
    PUT: 'method-put-bg',
    PATCH: 'method-patch-bg',
    DELETE: 'method-delete-bg',
  };

  constructor(private mockStore: MockStoreService) {}

  get mockUrl(): string {
    return `${window.location.origin}/m/${this.endpoint.id}`;
  }

  get methodColor(): string {
    return this.methodColors[this.endpoint.method] || '';
  }

  get methodBg(): string {
    return this.methodBgColors[this.endpoint.method] || '';
  }

  copyUrl(): void {
    navigator.clipboard.writeText(this.mockUrl).then(() => {
      this.urlCopied = true;
      setTimeout(() => (this.urlCopied = false), 2000);
    });
  }

  async deleteEndpoint(): Promise<void> {
    await this.mockStore.deleteEndpoint(this.endpoint.id);
  }

  async toggleEndpoint(): Promise<void> {
    await this.mockStore.toggleEndpoint(this.endpoint.id);
  }
}
