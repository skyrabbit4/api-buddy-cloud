import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map, switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    // Wait until the auth service has finished loading the sessionys
    // before deciding whether to allow access
    return this.authService.isLoaded$.pipe(
      filter(loaded => loaded),
      take(1),
      switchMap(() => this.authService.session$),
      take(1),
      map(session => {
        if (session) {
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}
