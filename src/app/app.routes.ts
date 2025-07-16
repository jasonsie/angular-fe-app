import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
  { path: 'lab', loadComponent: () => import('./lab/lab.component').then(m => m.LabComponent) },
  { path: '**', redirectTo: '/' } // Wildcard route for invalid URLs - must be last
];
