import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SummaryCard } from '@/components/SummaryCard';
import { MonthlyInputTable } from '@/components/MonthlyInputTable';
import { ExpenseChart } from '@/components/ExpenseChart';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProfileButton } from '@/components/ProfileButton';
import { MonthYearSelector } from '@/components/MonthYearSelector';
import { FinanceDashboardSelector } from '@/components/FinanceDashboardSelector';
import { Transaction } from '@/types/finance';
import { LogOutIcon, DownloadIcon } from 'lucide-react';
import app_logo from '@/components/app_logo.png';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { exportIncomesToCSV, exportExpensesToCSV } from '@/utils/csvUtils';

const Index = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [incomeCategories, setIncomeCategories] = useState<string[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  const [selectedDashboardId, setSelectedDashboardId] = useState<string | null>(null);
  const [selectedDashboardName, setSelectedDashboardName] = useState<string>('');
  
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
    if (!userId || !selectedDashboardId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('dashboard_id', selectedDashboardId)
      .order('date', { ascending: false });

    if (error) {
      toast.error('Error fetching transactions: ' + error.message);
    } else {
      setTransactions((data || []) as Transaction[]);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    if (!userId || !selectedDashboardId) return;

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .eq('dashboard_id', selectedDashboardId);

    if (!error && data) {
      setIncomeCategories(data.filter(c => c.type === 'INCOME').map(c => c.name));
      setExpenseCategories(data.filter(c => c.type === 'EXPENSE').map(c => c.name));
    }
  };

  useEffect(() => {
    if (userId && selectedDashboardId) {
      fetchTransactions();
      fetchCategories();
    }
  }, [userId, selectedDashboardId]);

  const handleDashboardChange = (dashboardId: string, dashboardName: string) => {
    setSelectedDashboardId(dashboardId);
    setSelectedDashboardName(dashboardName);
  };

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

  // Filter transactions by selected month and year
  const filteredTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
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
              <div className="rounded-lg p-1.5 sm:p-2">
                <img
                  src={app_logo}
                  alt="App logo"
                  className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                />
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
        {/* Dashboard & Month/Year Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {userId && (
              <FinanceDashboardSelector
                userId={userId}
                selectedDashboardId={selectedDashboardId}
                onDashboardChange={handleDashboardChange}
              />
            )}
            <MonthYearSelector
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthYearChange={(month, year) => {
                setSelectedMonth(month);
                setSelectedYear(year);
              }}
            />
          </div>
          {selectedDashboardName && (
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {selectedDashboardName}
            </Badge>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <SummaryCard title={t('summary.totalIncome')} amount={totalIncome} type="income" />
          <SummaryCard title={t('summary.totalExpense')} amount={totalExpense} type="expense" />
          <SummaryCard title={t('summary.netProfit')} amount={netProfit} type="profit" />
        </div>

        {/* Expense Charts */}
        {userId && selectedDashboardId && (
          <ExpenseChart 
            transactions={filteredTransactions} 
            userId={userId}
            dashboardId={selectedDashboardId}
            onCategoriesChange={fetchCategories}
          />
        )}

        {/* Monthly Input Table */}
        <MonthlyInputTable 
          currentMonth={selectedMonth}
          currentYear={selectedYear}
          onDataChange={fetchTransactions}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
          transactions={filteredTransactions}
          dashboardId={selectedDashboardId}
        />
      </main>
    </div>
  );
};

export default Index;
