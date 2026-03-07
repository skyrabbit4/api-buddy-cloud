import { Component, ElementRef, HostListener } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Session } from '@supabase/supabase-js';

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
}

@Component({
  selector: 'app-profile-menu',
  standalone: false,
  templateUrl: './profile-menu.html',
  styleUrl: './profile-menu.css',
})
export class ProfileMenuComponent {
  isOpen = false;
  profile$: Observable<UserProfile | null>;

  constructor(
    private authService: AuthService,
    private elRef: ElementRef
  ) {
    this.profile$ = this.authService.session$.pipe(
      map((session: Session | null) => {
        if (!session?.user) return null;
        const user = session.user;
        const meta = user.user_metadata || {};
        const name = meta['full_name'] || meta['name'] || user.email?.split('@')[0] || 'User';
        const email = user.email || '';
        const avatarUrl = meta['avatar_url'] || meta['picture'] || null;
        const initials = name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2);
        return { name, email, avatarUrl, initials };
      })
    );
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  signOut(): void {
    this.isOpen = false;
    this.authService.signOut();
  }
}
