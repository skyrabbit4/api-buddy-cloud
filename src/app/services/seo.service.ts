import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  noIndex?: boolean;
}

const BASE_URL = 'https://mockapi.store';

const DEFAULT_CONFIG: SeoConfig = {
  title: 'MockAPI — Mock HTTP Endpoints Instantly',
  description:
    'Create and manage mock HTTP endpoints instantly. Custom JSON responses, status codes, and delays. Build your frontend without waiting for the backend.',
  keywords:
    'mock api, api mocking, mock http endpoints, fake api, rest api mock, mock server online, json mock api, api stub, frontend development tools, api testing tool, free mock api, mock api server, http mock server, api simulator',
  ogImage: `${BASE_URL}/og-image.png`,
  ogUrl: BASE_URL,
};

const PAGE_SEO: Record<string, SeoConfig> = {
  '/': DEFAULT_CONFIG,
  '/login': {
    title: 'Sign In to MockAPI — Start Mocking APIs for Free',
    description:
      'Sign in to MockAPI with Google or GitHub to create and manage your mock HTTP endpoints. Get started in seconds — no credit card required.',
    keywords: 'mock api login, api mocking sign in, mockapi account, free api mocking tool',
    ogUrl: `${BASE_URL}/login`,
    noIndex: false,
  },
  '/dashboard': {
    title: 'Dashboard | MockAPI',
    description: 'Manage your mock API endpoints from the MockAPI dashboard.',
    ogUrl: `${BASE_URL}/dashboard`,
    noIndex: true,
  },
  '/auth/callback': {
    title: 'Signing In… | MockAPI',
    description: 'Completing authentication…',
    noIndex: true,
  },
};

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  constructor(
    private titleService: Title,
    private metaService: Meta,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  init(): void {
    // Apply SEO for the initial route immediately
    this.applySeoForUrl(this.router.url || '/');

    // Then update on every subsequent navigation
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.applySeoForUrl(event.urlAfterRedirects);
      });
  }

  private applySeoForUrl(url: string): void {
    // Strip query params and fragments for lookup
    const path = url.split('?')[0].split('#')[0] || '/';
    const config = PAGE_SEO[path] ?? DEFAULT_CONFIG;
    this.updateSeo(config, path);
  }

  updateSeo(config: SeoConfig, path?: string): void {
    // Title
    this.titleService.setTitle(config.title);

    // Description
    this.metaService.updateTag({ name: 'description', content: config.description });

    // Keywords
    if (config.keywords) {
      this.metaService.updateTag({ name: 'keywords', content: config.keywords });
    }

    // Robots
    const robotsContent = config.noIndex
      ? 'noindex, nofollow'
      : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
    this.metaService.updateTag({ name: 'robots', content: robotsContent });

    // Canonical
    const canonicalUrl =
      config.ogUrl ?? (path ? `${BASE_URL}${path === '/' ? '' : path}` : BASE_URL);
    this.setCanonical(canonicalUrl);

    // Open Graph
    this.metaService.updateTag({ property: 'og:title', content: config.title });
    this.metaService.updateTag({ property: 'og:description', content: config.description });
    this.metaService.updateTag({ property: 'og:url', content: canonicalUrl });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:locale', content: 'en_US' });
    if (config.ogImage) {
      this.metaService.updateTag({ property: 'og:image', content: config.ogImage });
      this.metaService.updateTag({ property: 'og:image:width', content: '1200' });
      this.metaService.updateTag({ property: 'og:image:height', content: '630' });
    }

    // Twitter Card
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: config.title });
    this.metaService.updateTag({ name: 'twitter:description', content: config.description });
    this.metaService.updateTag({ name: 'twitter:url', content: canonicalUrl });
    if (config.ogImage) {
      this.metaService.updateTag({ name: 'twitter:image', content: config.ogImage });
    }
  }

  private setCanonical(url: string): void {
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
