import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-shell/main-shell').then((m) => m.MainShell),
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
      { path: '', pathMatch: 'full', redirectTo: 'jobs' },
    ],
  },
  { path: '**', redirectTo: '' },
];
