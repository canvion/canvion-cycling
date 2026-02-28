import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register').then(m => m.Register) },

  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard), canActivate: [AuthGuard] },
  { path: 'activities', loadComponent: () => import('./features/activities/activity-list/activity-list').then(m => m.ActivityList), canActivate: [AuthGuard] },
  { path: 'activities/:id', loadComponent: () => import('./features/activities/activity-detail/activity-detail').then(m => m.ActivityDetail), canActivate: [AuthGuard] },
  { path: 'records', loadComponent: () => import('./features/records/records').then(m => m.Records), canActivate: [AuthGuard] },

  { path: 'stats', loadComponent: () => import('./features/stats/stats').then(m => m.Stats), canActivate: [AuthGuard] },

  { path: 'calendar', loadComponent: () => import('./features/calendar/calendar').then(m => m.Calendar), canActivate: [AuthGuard] },

  // Siempre al final
  { path: '**', loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
