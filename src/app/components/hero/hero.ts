import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: false,
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class HeroComponent {
  constructor(private router: Router) {}

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  copyCode(): void {
    const code = `fetch("https://mockapi.dev/api/v1/users")\n  .then(res => res.json())\n  .then(data => console.log(data))`;
    navigator.clipboard.writeText(code);
  }
}
