import { NavTab } from './main-shell.models';

/** Навигация работника. */
export const WORKER_NAV_TABS: NavTab[] = [
  { path: 'jobs', label: 'Поиск работы', icon: 'work_outline' },
  { path: 'applications', label: 'Мои заявки', icon: 'assignment' },
  { path: 'finances', label: 'Финансы', icon: 'account_balance_wallet' },
];

/** Навигация администратора. */
export const ADMIN_NAV_TABS: NavTab[] = [
  { path: 'admin/orders', label: 'Заявки', icon: 'list_alt' },
  { path: 'admin/users', label: 'Пользователи', icon: 'group' },
];
