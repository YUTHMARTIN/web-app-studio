import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SummaryCard } from '@/components/SummaryCard';
import { MonthlyInputTable } from '@/components/MonthlyInputTable';
import { ExpenseChart } from '@/components/ExpenseChart';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { MonthYearSelector } from '@/components/MonthYearSelector';
import { Transaction } from '@/types/finance';
import { WalletIcon, LogOutIcon, DownloadIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { exportIncomesToCSV, exportExpensesToCSV } from '@/utils/csvUtils';
import { CSVImportButton } from '@/components/CSVImportButton';

const Index = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUserId(session.user.id);
    };

    checkAuth();

    // Listen for auth changes
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
            <div className="flex items-center gap-2">
              <CSVImportButton onImportComplete={fetchTransactions} />
              <Button variant="outline" size="sm" onClick={handleExportIncomes}>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export Incomes CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportExpenses}>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export Expenses CSV
              </Button>
              <LanguageSwitcher />
              <Button variant="outline" size="icon" onClick={handleLogout}>
                <LogOutIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
