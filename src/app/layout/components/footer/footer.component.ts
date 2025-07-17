import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatIcon, MatButton],
  template: `
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-info">
          <p>&copy; {{ currentYear }} My App. Built with Angular {{ angularVersion }}</p>
        </div>

        <div class="footer-links">
          <button mat-button>
            <mat-icon>code</mat-icon>
            GitHub
          </button>
          <button mat-button>
            <mat-icon>description</mat-icon>
            Documentation
          </button>
        </div>
      </div>
    </footer>
  `,
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-footer-container',
  },
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
  readonly angularVersion = '20';
}
