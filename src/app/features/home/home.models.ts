export interface StatCard {
  icon: string;
  label: string;
  value: string;
  trend: string;
  positive: boolean;
}

export interface Transaction {
  icon: string;
  title: string;
  date: string;
  amount: string;
  incoming: boolean;
}
