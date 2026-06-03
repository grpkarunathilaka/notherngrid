import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home)
  },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'menu',
    loadComponent: () => import('./pages/menu/menu').then(m => m.Menu)
  },
  {
    path: 'bookings',
    loadComponent: () => import('./pages/bookings/bookings').then(m => m.Bookings)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then(m => m.About)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
