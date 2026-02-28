import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // Redirige la raíz al dashboard
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Rutas públicas (sin guard)
  { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register').then(m => m.Register) },

  // Rutas protegidas (con guard)
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard), canActivate: [AuthGuard] },
  { path: 'activities', loadComponent: () => import('./features/activities/activity-list/activity-list').then(m => m.ActivityList), canActivate: [AuthGuard] },
  {  path: 'activities/:id', loadComponent: () => import('./features/activities/activity-detail/activity-detail').then(m => m.ActivityDetail), canActivate: [AuthGuard] },

  // Cualquier ruta desconocida redirige al dashboard
  { path: '**', loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent) }
];
