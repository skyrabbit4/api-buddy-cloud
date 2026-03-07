import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  error: string | null = null;

  constructor(private authService: AuthService) {}

  async loginWithGoogle(): Promise<void> {
    try {
      this.error = null;
      await this.authService.signInWithGoogle();
    } catch (err: any) {
      this.error = err.message;
    }
  }

  async loginWithGitHub(): Promise<void> {
    try {
      this.error = null;
      await this.authService.signInWithGitHub();
    } catch (err: any) {
      this.error = err.message;
    }
  }
}
