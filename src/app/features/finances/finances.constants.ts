import { IncomePeriod } from './finances.models';

/** Палитра секторов круговой диаграммы дохода. */
export const INCOME_CHART_PALETTE = ['#3ddc84', '#ffd24d', '#4dabf7', '#a78bfa', '#f06595'];

export const PERIOD_LABELS: Record<IncomePeriod, string> = {
  week: 'за неделю',
  month: 'за месяц',
  year: 'за год',
};
