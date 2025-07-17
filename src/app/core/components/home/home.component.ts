import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
  MatCardActions,
} from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatDivider } from '@angular/material/divider';

interface FeatureCard {
  title: string;
  description: string;
  icon: string;
  route?: string;
  action?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCardActions,
    MatButton,
    MatIcon,
    MatChip,
    MatChipSet,
    MatDivider,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  host: {
    class: 'main-content home-page',
  },
})
export class HomeComponent implements OnInit {
  private router = inject(Router);

  // Using signals for reactive state management
  readonly techStack = signal([
    'Angular 19+',
    'Material Design',
    'TypeScript',
    'Standalone Components',
    'Signals',
  ]);

  readonly features = signal<FeatureCard[]>([
    {
      title: 'Material Design',
      description:
        'Beautiful, consistent UI components following Material Design principles.',
      icon: 'palette',
      route: '/lab',
      action: 'View Components',
    },
    {
      title: 'Modern Angular',
      description:
        'Built with the latest Angular features including standalone components and signals.',
      icon: 'auto_awesome',
    },
    {
      title: 'Responsive Design',
      description:
        'Fully responsive layout that works great on desktop, tablet, and mobile devices.',
      icon: 'devices',
    },
    {
      title: 'Accessibility',
      description:
        'Designed with accessibility in mind, following WCAG guidelines and best practices.',
      icon: 'accessibility',
    },
  ]);

  ngOnInit(): void {
    // Component initialization
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
