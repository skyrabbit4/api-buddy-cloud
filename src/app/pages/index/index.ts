import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const SCROLL_TOP_THRESHOLD = 400;

@Component({
  selector: 'app-index',
  standalone: false,
  templateUrl: './index.html',
  styleUrl: './index.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndexComponent implements OnInit, OnDestroy {
  showScrollTop = false;

  private scrollListener!: EventListenerOrEventListenerObject;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Run the scroll handler OUTSIDE Angular's zone so it does NOT trigger
    // change detection on every pixel scrolled — a major INP / jank source.
    // We only call markForCheck() when the boolean actually flips, making
    // the overhead near-zero while the user scrolls through content.
    this.ngZone.runOutsideAngular(() => {
      this.scrollListener = () => {
        const shouldShow = window.scrollY > SCROLL_TOP_THRESHOLD;
        if (shouldShow !== this.showScrollTop) {
          this.showScrollTop = shouldShow;
          // Re-enter the zone only for this single targeted update.
          this.cdr.markForCheck();
        }
      };

      // { passive: true } tells the browser this handler will never call
      // preventDefault(), unlocking hardware-accelerated scrolling.
      window.addEventListener('scroll', this.scrollListener, { passive: true });
    });
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.removeEventListener('scroll', this.scrollListener);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
