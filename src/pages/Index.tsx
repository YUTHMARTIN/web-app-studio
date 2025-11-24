import { useState } from 'react';
import { SummaryCard } from '@/components/SummaryCard';
import { TransactionTable } from '@/components/TransactionTable';
import { MonthlyInputTable } from '@/components/MonthlyInputTable';
import { ExpenseChart } from '@/components/ExpenseChart';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { mockTransactions } from '@/lib/mockData';
import { Transaction } from '@/types/finance';
import { WalletIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);

  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const handleAddTransactions = (newTransactions: Omit<Transaction, 'id'>[]) => {
    const transactionsWithIds: Transaction[] = newTransactions.map((t, index) => ({
      ...t,
      id: `${Date.now()}-${index}`,
    }));
    setTransactions([...transactionsWithIds, ...transactions]);
  };

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary p-2">
                <WalletIcon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t('header.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('header.subtitle')}</p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard title={t('summary.totalIncome')} amount={totalIncome} type="income" />
          <SummaryCard title={t('summary.totalExpense')} amount={totalExpense} type="expense" />
          <SummaryCard title={t('summary.netProfit')} amount={netProfit} type="profit" />
        </div>

        {/* Expense Charts */}
        <ExpenseChart transactions={transactions} />

        {/* Monthly Input Table */}
        <MonthlyInputTable 
          onAddTransactions={handleAddTransactions}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />

        {/* Transactions Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{t('transactions.title')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('transactions.subtitle')}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {transactions.length} {transactions.length !== 1 ? t('transactions.counts') : t('transactions.count')}
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
