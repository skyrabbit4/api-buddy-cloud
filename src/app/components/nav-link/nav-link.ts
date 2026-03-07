import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-nav-link',
  standalone: false,
  templateUrl: './nav-link.html',
  styleUrl: './nav-link.css',
})
export class NavLinkComponent {
  @Input()
  routerLink: string | any[] | null | undefined;

  @Input()
  className: string = '';

  @Input()
  activeClassName: string = '';

  @Input()
  pendingClassName: string = '';
}
