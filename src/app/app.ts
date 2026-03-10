import { Component, signal } from '@angular/core';
import { AuthService } from './services/auth.service';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css',
})
export class AppComponent {
  protected readonly title = signal('api-buddy-cloud');

  constructor(
    private authService: AuthService,
    private seoService: SeoService,
  ) {
    // Initialise per-page SEO (title, description, canonical, OG, Twitter)
    // Must be called here so it runs before the first route is rendered.
    this.seoService.init();
  }
}
