import { useState } from 'react';
import { SummaryCard } from '@/components/SummaryCard';
import { TransactionTable } from '@/components/TransactionTable';
import { AddTransactionForm } from '@/components/AddTransactionForm';
import { mockTransactions } from '@/lib/mockData';
import { Transaction } from '@/types/finance';
import { WalletIcon } from 'lucide-react';

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);

  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: Date.now().toString(),
    };
    setTransactions([transaction, ...transactions]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <WalletIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Finance Dashboard</h1>
              <p className="text-sm text-muted-foreground">Track your income and expenses</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard title="Total Income" amount={totalIncome} type="income" />
          <SummaryCard title="Total Expense" amount={totalExpense} type="expense" />
          <SummaryCard title="Net Profit" amount={netProfit} type="profit" />
        </div>

        {/* Add Transaction Form */}
        <AddTransactionForm onAdd={handleAddTransaction} />

        {/* Transactions Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Recent Transactions</h2>
              <p className="text-sm text-muted-foreground">
                View and manage your transaction history
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </div>
          </div>
          <TransactionTable 
            transactions={transactions} 
            onDelete={handleDeleteTransaction}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
