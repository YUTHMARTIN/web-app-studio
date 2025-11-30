import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SummaryCard } from '@/components/SummaryCard';
import { MonthlyInputTable } from '@/components/MonthlyInputTable';
import { ExpenseChart } from '@/components/ExpenseChart';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProfileButton } from '@/components/ProfileButton';
import { MonthYearSelector } from '@/components/MonthYearSelector';
import { Transaction } from '@/types/finance';
import { WalletIcon, LogOutIcon, DownloadIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { exportIncomesToCSV, exportExpensesToCSV } from '@/utils/csvUtils';

const Index = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUserId(session.user.id);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUserId(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchTransactions = async () => {
    if (!userId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      toast.error('Error fetching transactions: ' + error.message);
    } else {
      setTransactions((data || []) as Transaction[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleExportIncomes = () => {
    try {
      exportIncomesToCSV(transactions);
      toast.success('Incomes exported successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error exporting incomes');
    }
  };

  const handleExportExpenses = () => {
    try {
      exportExpensesToCSV(transactions);
      toast.success('Expenses exported successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error exporting expenses');
    }
  };

  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary p-1.5 sm:p-2">
                <WalletIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                {t('header.title')}{username ? ` - ${username}` : ''}
              </h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={handleExportIncomes} className="text-xs sm:text-sm h-8 px-2 sm:px-3">
                <DownloadIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Export Incomes CSV</span>
                <span className="sm:hidden">Incomes</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportExpenses} className="text-xs sm:text-sm h-8 px-2 sm:px-3">
                <DownloadIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Export Expenses CSV</span>
                <span className="sm:hidden">Expenses</span>
              </Button>
              <LanguageSwitcher />
              <ThemeToggle />
              {userId && <ProfileButton userId={userId} onUsernameChange={setUsername} />}
              <Button variant="outline" size="icon" onClick={handleLogout} className="h-8 w-8">
                <LogOutIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Month/Year Selector */}
        <div className="flex justify-start">
          <MonthYearSelector
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthYearChange={(month, year) => {
              setSelectedMonth(month);
              setSelectedYear(year);
            }}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <SummaryCard title={t('summary.totalIncome')} amount={totalIncome} type="income" />
          <SummaryCard title={t('summary.totalExpense')} amount={totalExpense} type="expense" />
          <SummaryCard title={t('summary.netProfit')} amount={netProfit} type="profit" />
        </div>

        {/* Expense Charts */}
        <ExpenseChart transactions={transactions} />

        {/* Monthly Input Table */}
        <MonthlyInputTable 
          currentMonth={selectedMonth}
          currentYear={selectedYear}
          onDataChange={fetchTransactions}
        />
      </main>
    </div>
  );
};

export default Index;
