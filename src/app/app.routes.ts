import { Routes } from '@angular/router';

export const routes: Routes = [
  // Login route with no layout
  {
    path: 'login',
    loadComponent: () => import('./core/components/auth/login/login.component').then(m => m.LoginComponent)
  },

  // Main application routes with layout
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./core/components/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'lab',
        loadComponent: () => import('./core/components/lab/lab.component').then(m => m.LabComponent)
      },
    ]
  },

  // Wildcard route for invalid URLs - must be last
  { path: '**', redirectTo: '/' }
];
