export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  recentTransactions: Transaction[];
}
