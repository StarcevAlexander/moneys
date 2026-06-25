import { AdminOrder, ManagedUser } from './admin.models';

/** Стартовый список пользователей. Первый — штатный работник с учёткой «123». */
export const DEFAULT_USERS: ManagedUser[] = [
  {
    id: 'user-worker',
    login: '123',
    fullName: 'Иванов Иван Иванович',
    city: 'Иркутск',
    active: true,
    ratings: [
      {
        id: 'rating-worker-1',
        reliability: 5,
        performance: 5,
        comment: 'Вышел вовремя, работу выполнил без замечаний.',
        ratedAt: '2026-06-20T18:00:00.000Z',
      },
      {
        id: 'rating-worker-2',
        reliability: 4,
        performance: 5,
        ratedAt: '2026-06-12T18:00:00.000Z',
      },
    ],
  },
  {
    id: 'user-petrov',
    login: 'petrov',
    fullName: 'Петров Пётр Петрович',
    city: 'Ангарск',
    active: true,
    ratings: [
      {
        id: 'rating-petrov-1',
        orderId: 'order-aviazavod',
        reliability: 3,
        performance: 4,
        comment: 'Опоздал на смену, но работу сделал качественно.',
        ratedAt: '2026-06-18T20:00:00.000Z',
      },
    ],
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
    city: 'Иркутск',
    address: 'ул. Сергеева, 3А',
    payout: '₽ 2 800 / смена',
    schedule: 'Сегодня · 09:00–18:00',
    description: 'Сборка и упаковка заказов на складе торгового центра.',
    status: 'open',
  },
  {
    id: 'order-aviazavod',
    title: 'Грузчик',
    company: 'Ангарский завод полимеров',
    city: 'Ангарск',
    address: 'г. Ангарск, 89 квартал',
    payout: '₽ 3 200 / смена',
    schedule: 'Завтра · 08:00–20:00',
    description: 'Погрузочно-разгрузочные работы на территории предприятия.',
    status: 'done',
    assignedUserId: 'user-petrov',
  },
  {
    id: 'order-bytovaya-tehnika',
    title: 'Сборщик мебели',
    company: 'Мебельный цех «Комфорт»',
    city: 'Шелехов',
    address: 'ул. Розы Люксембург, 184',
    payout: '₽ 2 500 / смена',
    schedule: 'Отменена заказчиком',
    description: 'Сборка корпусной мебели на территории заказчика.',
    status: 'cancelled',
  },
];
