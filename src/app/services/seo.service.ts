import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  noIndex?: boolean;
}

const DEFAULT_CONFIG: SeoConfig = {
  title: 'MockAPI — Mock HTTP Endpoints Instantly',
  description: 'Create and manage mock HTTP endpoints instantly. Build your frontend without waiting for backend APIs.',
  keywords: 'mock api, api mocking, http endpoints, rest api, frontend development',
  ogImage: 'https://mockapi.dev/og-image.png'
};

const PAGE_SEO: Record<string, SeoConfig> = {
  '/': DEFAULT_CONFIG,
  '/login': {
    title: 'Sign In | MockAPI',
    description: 'Sign in to MockAPI to create and manage your mock HTTP endpoints.',
    noIndex: false
  },
  '/dashboard': {
    title: 'Dashboard | MockAPI',
    description: 'Manage your mock API endpoints from the MockAPI dashboard.',
    noIndex: true
  },
  '/auth-callback': {
    title: 'Signing In... | MockAPI',
    description: 'Completing authentication...',
    noIndex: true
  }
};

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private titleService: Title,
    private metaService: Meta,
    private router: Router
  ) {}

  init(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const config = PAGE_SEO[event.urlAfterRedirects] || DEFAULT_CONFIG;
      this.updateSeo(config);
    });
  }

  updateSeo(config: SeoConfig): void {
    this.titleService.setTitle(config.title);

    this.metaService.updateTag({ name: 'description', content: config.description });

    if (config.keywords) {
      this.metaService.updateTag({ name: 'keywords', content: config.keywords });
    }

    if (config.noIndex) {
      this.metaService.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
    }

    // Open Graph
    this.metaService.updateTag({ property: 'og:title', content: config.title });
    this.metaService.updateTag({ property: 'og:description', content: config.description });
    if (config.ogImage) {
      this.metaService.updateTag({ property: 'og:image', content: config.ogImage });
    }

    // Twitter
    this.metaService.updateTag({ name: 'twitter:title', content: config.title });
    this.metaService.updateTag({ name: 'twitter:description', content: config.description });
    if (config.ogImage) {
      this.metaService.updateTag({ name: 'twitter:image', content: config.ogImage });
    }
  }
}
