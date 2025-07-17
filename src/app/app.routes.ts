import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./core/components/home/home.component').then(m => m.HomeComponent) },
  { path: 'lab', loadComponent: () => import('./core/components/lab/lab.component').then(m => m.LabComponent) },
  { path: '**', redirectTo: '/' } // Wildcard route for invalid URLs - must be last
];
