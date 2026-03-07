import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Session } from '@supabase/supabase-js';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {
  session$: Observable<Session | null>;

  constructor(private authService: AuthService) {
    this.session$ = this.authService.session$;
  }

  signOut(): void {
    this.authService.signOut();
  }
}
