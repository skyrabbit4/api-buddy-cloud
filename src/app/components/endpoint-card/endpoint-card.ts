import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { MockEndpoint, MockStoreService } from '../../services/mock-store.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-endpoint-card',
  standalone: false,
  templateUrl: './endpoint-card.html',
  styleUrl: './endpoint-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EndpointCardComponent implements OnInit {
  @Input() endpoint!: MockEndpoint;

  urlCopied = false;
  requestCount = 0;
  lastRequestAt: string | null = null;
  recentRequests: { method: string; status_code: number; created_at: string }[] = [];
  showHistory = false;

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

  constructor(
    private mockStore: MockStoreService,
    private supabaseService: SupabaseService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadStats();
  }

  private async loadStats(): Promise<void> {
    const supabase = this.supabaseService.getSupabase();
    if (!supabase) return;

    const { count } = await supabase
      .from('request_logs')
      .select('id', { count: 'exact', head: true })
      .eq('endpoint_id', this.endpoint.id);

    this.requestCount = count || 0;

    const { data } = await supabase
      .from('request_logs')
      .select('created_at')
      .eq('endpoint_id', this.endpoint.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    this.lastRequestAt = data?.created_at || null;
  }

  async toggleHistory(): Promise<void> {
    this.showHistory = !this.showHistory;
    if (this.showHistory && this.recentRequests.length === 0) {
      const supabase = this.supabaseService.getSupabase();
      if (!supabase) return;

      const { data } = await supabase
        .from('request_logs')
        .select('method, status_code, created_at')
        .eq('endpoint_id', this.endpoint.id)
        .order('created_at', { ascending: false })
        .limit(10);

      this.recentRequests = data || [];
    }
  }

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
