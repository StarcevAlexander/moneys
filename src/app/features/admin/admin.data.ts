import { AdminOrder, ManagedUser } from './admin.models';

/** Стартовый список пользователей. Первый — штатный работник с учёткой «123». */
export const DEFAULT_USERS: ManagedUser[] = [
  { id: 'user-worker', login: '123', fullName: 'Иванов Иван Иванович', active: true },
  { id: 'user-petrov', login: 'petrov', fullName: 'Петров Пётр Петрович', active: true },
  { id: 'user-sidorova', login: 'sidorova', fullName: 'Сидорова Анна Сергеевна', active: true },
];

/** Стартовый список заявок. */
export const DEFAULT_ORDERS: AdminOrder[] = [
  {
    id: 'order-silver-mall',
    title: 'Комплектовщик заказов',
    company: 'Склад ТЦ «Сильвер Молл»',
    address: 'ул. Сергеева, 3А',
    payout: '₽ 2 800 / смена',
    schedule: 'Сегодня · 09:00–18:00',
    description: 'Сборка и упаковка заказов на складе торгового центра.',
    status: 'open',
  },
  {
    id: 'order-aviazavod',
    title: 'Грузчик',
    company: 'Иркутский авиазавод',
    address: 'ул. Новаторов, 3',
    payout: '₽ 3 200 / смена',
    schedule: 'Завтра · 08:00–20:00',
    description: 'Погрузочно-разгрузочные работы на территории предприятия.',
    status: 'assigned',
    assignedUserId: 'user-petrov',
  },
];
