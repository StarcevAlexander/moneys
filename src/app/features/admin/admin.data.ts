import { AdminOrder, ManagedUser } from './admin.models';

/** Стартовый список пользователей. Первый — штатный работник с учёткой «123». */
export const DEFAULT_USERS: ManagedUser[] = [
  {
    id: 'user-worker',
    login: '123',
    fullName: 'Иванов Иван Иванович',
    city: 'Иркутск',
    active: true,
  },
  {
    id: 'user-petrov',
    login: 'petrov',
    fullName: 'Петров Пётр Петрович',
    city: 'Ангарск',
    active: true,
  },
  {
    id: 'user-sidorova',
    login: 'sidorova',
    fullName: 'Сидорова Анна Сергеевна',
    city: 'Шелехов',
    active: true,
  },
  {
    id: 'user-kuznetsov',
    login: 'kuznetsov',
    fullName: 'Кузнецов Дмитрий Олегович',
    city: 'Братск',
    active: true,
  },
  {
    id: 'user-smirnova',
    login: 'smirnova',
    fullName: 'Смирнова Елена Викторовна',
    city: 'Усолье-Сибирское',
    active: true,
  },
  {
    id: 'user-popov',
    login: 'popov',
    fullName: 'Попов Андрей Сергеевич',
    city: 'Усть-Илимск',
    active: true,
  },
  {
    id: 'user-vasileva',
    login: 'vasileva',
    fullName: 'Васильева Ольга Павловна',
    city: 'Черемхово',
    active: false,
  },
  {
    id: 'user-morozov',
    login: 'morozov',
    fullName: 'Морозов Игорь Николаевич',
    city: 'Саянск',
    active: true,
  },
  {
    id: 'user-novikova',
    login: 'novikova',
    fullName: 'Новикова Татьяна Юрьевна',
    city: 'Тулун',
    active: true,
  },
  {
    id: 'user-fedorov',
    login: 'fedorov',
    fullName: 'Фёдоров Максим Алексеевич',
    city: 'Зима',
    active: true,
  },
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
