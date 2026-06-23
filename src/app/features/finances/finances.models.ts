export type PaymentStatus = 'pending' | 'paid';

export interface Payment {
  id: string;
  title: string;
  date: string;
  amount: number;
  status: PaymentStatus;
}

export interface IncomeSlice {
  name: string;
  value: number;
}

export type IncomePeriod = 'week' | 'month' | 'year';

export interface PeriodIncome {
  total: number;
  slices: IncomeSlice[];
}

export interface FinanceSummary {
  label: string;
  value: string;
  icon: string;
  accent: 'green' | 'gold' | 'muted';
}
