import { Transaction } from '@/types/finance';

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2025-01-15',
    type: 'INCOME',
    category: 'Salary',
    amount: 5000,
    description: 'Monthly salary'
  },
  {
    id: '2',
    date: '2025-01-14',
    type: 'EXPENSE',
    category: 'Rent',
    amount: 1200,
    description: 'January rent payment'
  },
  {
    id: '3',
    date: '2025-01-12',
    type: 'EXPENSE',
    category: 'Groceries',
    amount: 250,
    description: 'Weekly grocery shopping'
  },
  {
    id: '4',
    date: '2025-01-10',
    type: 'INCOME',
    category: 'Freelance',
    amount: 800,
    description: 'Website design project'
  },
  {
    id: '5',
    date: '2025-01-08',
    type: 'EXPENSE',
    category: 'Utilities',
    amount: 150,
    description: 'Electric and water bills'
  },
  {
    id: '6',
    date: '2025-01-05',
    type: 'EXPENSE',
    category: 'Entertainment',
    amount: 75,
    description: 'Movie tickets and dinner'
  },
  {
    id: '7',
    date: '2025-01-03',
    type: 'INCOME',
    category: 'Dividends',
    amount: 120,
    description: 'Stock dividends'
  }
];
