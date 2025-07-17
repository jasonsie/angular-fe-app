import { Component, ViewEncapsulation, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `,
  styleUrl: './app.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'app-root',
  },
})
export class AppComponent {
  title = 'my-app';

  private readonly router = inject(Router);

  constructor() {
    // Track navigation for potential analytics or focus management
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Reset scroll position on navigation
        if (typeof document === 'object' && document) {
          const content = document.querySelector('main');
          if (content) {
            content.scrollTop = 0;
          }
        }
      });
  }
}
