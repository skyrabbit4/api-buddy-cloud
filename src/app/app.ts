import { Component, signal } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class AppComponent {
  protected readonly title = signal('api-buddy-cloud');

  // Inject AuthService (which injects SupabaseService) early
  // so the Supabase client is created before routes are resolved
  constructor(private authService: AuthService) {}
}
