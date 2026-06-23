import { FinanceSummary, IncomePeriod, Payment, PeriodIncome } from './finances.models';

export const SUMMARY_CARDS: FinanceSummary[] = [
  {
    label: 'Получено за месяц',
    value: '₽ 48 200',
    icon: 'account_balance_wallet',
    accent: 'green',
  },
  { label: 'Ожидает выплаты', value: '₽ 11 900', icon: 'schedule', accent: 'gold' },
  { label: 'Смен закрыто', value: '17', icon: 'task_alt', accent: 'muted' },
  { label: 'Средняя смена', value: '₽ 2 835', icon: 'trending_up', accent: 'muted' },
];

export const PAYMENTS: Payment[] = [
  { id: 'p-1', title: 'Грузчик · Авиазавод', date: '24 июня', amount: 3200, status: 'pending' },
  {
    id: 'p-2',
    title: 'Разнорабочий · БайкалСтрой',
    date: '26 июня',
    amount: 3500,
    status: 'pending',
  },
  {
    id: 'p-3',
    title: 'Комплектовщик · Сильвер Молл',
    date: '23 июня',
    amount: 2800,
    status: 'pending',
  },
  { id: 'p-4', title: 'Официант · банкет', date: '23 июня', amount: 2400, status: 'pending' },
  { id: 'p-5', title: 'Промоутер · Слата', date: '20 июня', amount: 1900, status: 'paid' },
  { id: 'p-6', title: 'Курьер · СДЭК', date: '18 июня', amount: 2600, status: 'paid' },
  { id: 'p-7', title: 'Уборка · клининг', date: '15 июня', amount: 2200, status: 'paid' },
  { id: 'p-8', title: 'Сборщик мебели · Hoff', date: '12 июня', amount: 3000, status: 'paid' },
];

/** Структура дохода по типам работ за период — для круговой диаграммы. */
export const INCOME_BY_PERIOD: Record<IncomePeriod, PeriodIncome> = {
  week: {
    total: 11800,
    slices: [
      { name: 'Склад и логистика', value: 4500 },
      { name: 'Стройка', value: 3500 },
      { name: 'Общепит', value: 2400 },
      { name: 'Промо и реклама', value: 800 },
      { name: 'Доставка', value: 600 },
    ],
  },
  month: {
    total: 48200,
    slices: [
      { name: 'Склад и логистика', value: 18200 },
      { name: 'Стройка', value: 12500 },
      { name: 'Общепит', value: 9600 },
      { name: 'Промо и реклама', value: 4300 },
      { name: 'Доставка', value: 3600 },
    ],
  },
  year: {
    total: 486400,
    slices: [
      { name: 'Склад и логистика', value: 184000 },
      { name: 'Стройка', value: 132500 },
      { name: 'Общепит', value: 92400 },
      { name: 'Промо и реклама', value: 43500 },
      { name: 'Доставка', value: 34000 },
    ],
  },
};
