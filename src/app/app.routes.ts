import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard, homeRedirectGuard, workerGuard } from './core/guards';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-shell/main-shell').then((m) => m.MainShell),
    children: [
      // Настройки — доступны любому авторизованному пользователю (работник и админ).
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
      },
      // Рабочая часть — только для роли «работник».
      {
        path: '',
        canActivateChild: [workerGuard],
        children: [
          {
            path: 'jobs',
            loadComponent: () => import('./features/jobs/jobs').then((m) => m.Jobs),
          },
          {
            path: 'jobs/:id',
            loadComponent: () =>
              import('./features/jobs/job-detail/job-detail').then((m) => m.JobDetail),
          },
          {
            path: 'applications',
            loadComponent: () =>
              import('./features/applications/applications').then((m) => m.Applications),
          },
          {
            path: 'applications/:id',
            loadComponent: () =>
              import('./features/applications/application-detail/application-detail').then(
                (m) => m.ApplicationDetail,
              ),
          },
          {
            path: 'finances',
            loadComponent: () => import('./features/finances/finances').then((m) => m.Finances),
          },
        ],
      },
      // Админ-панель — только для роли «администратор».
      {
        path: 'admin',
        canActivateChild: [adminGuard],
        children: [
          {
            path: 'orders',
            loadComponent: () =>
              import('./features/admin/admin-orders/admin-orders').then((m) => m.AdminOrders),
          },
          {
            path: 'users',
            loadComponent: () =>
              import('./features/admin/admin-users/admin-users').then((m) => m.AdminUsers),
          },
          { path: '', pathMatch: 'full', redirectTo: 'orders' },
        ],
      },
      // Корень оболочки — редирект на домашний маршрут текущей роли.
      { path: '', pathMatch: 'full', canActivate: [homeRedirectGuard], children: [] },
    ],
  },
  { path: '**', redirectTo: '' },
];
