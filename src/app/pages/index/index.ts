import { Component, HostListener } from '@angular/core';

const SCROLL_TOP_THRESHOLD = 400;

@Component({
  selector: 'app-index',
  standalone: false,
  templateUrl: './index.html',
  styleUrl: './index.css',
})
export class IndexComponent {
  showScrollTop = false;

  @HostListener('window:scroll')
  onScroll(): void {
    this.showScrollTop = window.scrollY > SCROLL_TOP_THRESHOLD;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
