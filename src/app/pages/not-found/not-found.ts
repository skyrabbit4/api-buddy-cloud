import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-not-found',
  standalone: false,
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFoundComponent {
  constructor(private authService: AuthService) {}

  get homeLink(): string {
    return this.authService.currentSession ? '/dashboard' : '/';
  }
}
