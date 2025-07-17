import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Header } from '../../../core/models/layout.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatToolbar, MatButton, MatIcon],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-header',
  },
})
export class HeaderComponent {
  // Input for navigation items
  readonly headers = input<Header[]>([]);

  /**
   * Track function for navigation items
   */
  trackByRoute(index: number, header: Header): string {
    return header.route;
  }

  /**
   * Get router link active options based on route
   */
  getRouterLinkActiveOptions(route: string): { exact: boolean } {
    return { exact: route === '/' };
  }
}
