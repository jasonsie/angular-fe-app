import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { Header } from '../core/models/layout.model';
import { Headers } from '../core/config/header.config';

@Component({
  selector: 'app-layout',
  imports: [HeaderComponent, FooterComponent, RouterOutlet],
  template: `
    <div class="layout-container">
      <app-header [headers]="headers()" />
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
      <app-footer />
    </div>
  `,
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  readonly headers = signal<Header[]>(Headers);
}
