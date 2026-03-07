import { Component, ElementRef, HostListener } from '@angular/core';
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
  mobileMenuOpen = false;

  constructor(private authService: AuthService, private elRef: ElementRef) {
    this.session$ = this.authService.session$;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.mobileMenuOpen = false;
    }
  }

  signOut(): void {
    this.authService.signOut();
  }
}
