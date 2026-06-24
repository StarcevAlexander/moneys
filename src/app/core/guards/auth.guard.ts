import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../services';

/** Домашний маршрут роли: админ → панель заявок, работник → поиск работы. */
function roleHome(auth: AuthService): string {
  return auth.isAdmin() ? '/admin/orders' : '/jobs';
}

/** Пускает только авторизованных, иначе на /login. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

/** Не пускает авторизованных на форму входа — сразу на домашний маршрут роли. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? router.createUrlTree([roleHome(auth)]) : true;
};

/** Пускает только администратора, работника отправляет на его домашний маршрут. */
export const adminGuard: CanActivateChildFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }
  return auth.isAdmin() ? true : router.createUrlTree(['/jobs']);
};

/** Пускает только работника, администратора отправляет в его панель. */
export const workerGuard: CanActivateChildFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }
  return auth.isAdmin() ? router.createUrlTree(['/admin/orders']) : true;
};

/** Редирект с корня на домашний маршрут текущей роли. */
export const homeRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return router.createUrlTree([roleHome(auth)]);
};
