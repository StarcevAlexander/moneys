import { StatCard, Transaction } from './home.models';

export const STAT_CARDS: StatCard[] = [
  {
    icon: 'trending_up',
    label: 'Доход за месяц',
    value: '₽ 184 200',
    trend: '+12,4%',
    positive: true,
  },
  { icon: 'receipt_long', label: 'Заказы', value: '32', trend: '+5', positive: true },
  { icon: 'savings', label: 'Накопления', value: '₽ 512 900', trend: '+3,1%', positive: true },
  { icon: 'payments', label: 'Расходы', value: '₽ 47 600', trend: '-2,8%', positive: false },
];

export const TRANSACTIONS: Transaction[] = [
  {
    icon: 'shopping_bag',
    title: 'Заказ №1042',
    date: 'Сегодня, 14:20',
    amount: '+₽ 12 500',
    incoming: true,
  },
  {
    icon: 'card_giftcard',
    title: 'Кэшбэк',
    date: 'Сегодня, 09:05',
    amount: '+₽ 640',
    incoming: true,
  },
  { icon: 'local_cafe', title: 'Кофейня', date: 'Вчера, 18:42', amount: '-₽ 320', incoming: false },
  { icon: 'bolt', title: 'Подписка', date: '21 июня', amount: '-₽ 1 990', incoming: false },
];
