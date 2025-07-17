import { Component, ViewEncapsulation, inject } from '@angular/core';
import {
  RouterOutlet,
  Router,
  NavigationEnd,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Header } from './core/model/layout.model';
import { Headers } from './core/config/header.config';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbar,
    MatButton,
    MatIconButton,
    MatIcon,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'app-root',
  },
})
export class AppComponent {
  title = 'my-app';
  router = inject(Router);
  headers: Header[] = Headers;

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
