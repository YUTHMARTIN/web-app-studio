import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DayDetailsDialog } from './DayDetailsDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  date: string;
  type: string;
  category: string;
  amount: number;
}

interface MonthlyInputTableProps {
  currentMonth: number;
  currentYear: number;
  onDataChange: () => void;
  incomeCategories: string[];
  expenseCategories: string[];
  transactions: Transaction[];
  dashboardId: string | null;
}

const DEFAULT_INCOME_CATEGORIES = ['Income A', 'Income B', 'Income C', 'Income D'];
const DEFAULT_EXPENSE_CATEGORIES = ['Expense A', 'Expense B', 'Expense C', 'Expense D'];

export function MonthlyInputTable({ 
  currentMonth, 
  currentYear, 
  onDataChange,
  incomeCategories,
  expenseCategories,
  transactions,
  dashboardId,
}: MonthlyInputTableProps) {
  const { t } = useLanguage();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dayIncomes, setDayIncomes] = useState<Array<{ amount: string; category: string }>>([]);
  const [dayExpenses, setDayExpenses] = useState<Array<{ amount: string; category: string }>>([]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Get days that have transactions
  const daysWithData = new Set(
    transactions.map((t) => {
      const date = new Date(t.date);
      return date.getDate();
    })
  );

  const handleDayClick = async (day: number) => {
    setSelectedDay(day);
    setDialogOpen(true);
    
    // Fetch existing transactions for this day
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', dateStr)
      .eq('dashboard_id', dashboardId);

    if (!error && data) {
      const incomes = data
        .filter(t => t.type === 'INCOME')
        .map(t => ({ amount: t.amount.toString(), category: t.category }));
      
      const expenses = data
        .filter(t => t.type === 'EXPENSE')
        .map(t => ({ amount: t.amount.toString(), category: t.category }));

      setDayIncomes(incomes.length > 0 ? incomes : []);
      setDayExpenses(expenses.length > 0 ? expenses : []);
    } else {
      setDayIncomes([]);
      setDayExpenses([]);
    }
  };

  const handleSave = async (
    incomes: { amount: string; category: string }[],
    expenses: { amount: string; category: string }[]
  ) => {
    if (!selectedDay) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be logged in to save transactions');
      return;
    }

    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    
    // First, delete existing transactions for this day and dashboard
    await supabase
      .from('transactions')
      .delete()
      .eq('user_id', user.id)
      .eq('date', dateStr)
      .eq('dashboard_id', dashboardId);
    
    const newTransactions = [
      ...incomes
        .filter(item => item.amount && parseFloat(item.amount) > 0 && item.category)
        .map(item => ({
          user_id: user.id,
          date: dateStr,
          type: 'INCOME',
          category: item.category,
          amount: parseFloat(item.amount),
          description: `Income on ${dateStr}`,
          dashboard_id: dashboardId,
        })),
      ...expenses
        .filter(item => item.amount && parseFloat(item.amount) > 0 && item.category)
        .map(item => ({
          user_id: user.id,
          date: dateStr,
          type: 'EXPENSE',
          category: item.category,
          amount: parseFloat(item.amount),
          description: `Expense on ${dateStr}`,
          dashboard_id: dashboardId,
        })),
    ];

    // If no transactions, just close the dialog (data was already deleted above)
    if (newTransactions.length === 0) {
      toast.success('Day cleared');
      onDataChange();
      return;
    }

    const { error } = await supabase.from('transactions').insert(newTransactions);

    if (error) {
      toast.error('Error saving transactions: ' + error.message);
    } else {
      toast.success(`Saved ${newTransactions.length} transactions!`);
      onDataChange();
    }
  };

  const monthNames = [
    t('month.january'),
    t('month.february'),
    t('month.march'),
    t('month.april'),
    t('month.may'),
    t('month.june'),
    t('month.july'),
    t('month.august'),
    t('month.september'),
    t('month.october'),
    t('month.november'),
    t('month.december'),
  ];

  // Use custom categories or fallback to defaults
  const finalIncomeCategories = incomeCategories.length > 0 ? incomeCategories : DEFAULT_INCOME_CATEGORIES;
  const finalExpenseCategories = expenseCategories.length > 0 ? expenseCategories : DEFAULT_EXPENSE_CATEGORIES;

  return (
    <>
      <Card>
        <CardHeader className="py-3 sm:py-4 px-3 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            {monthNames[currentMonth]} {currentYear}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5 sm:gap-2">
            {days.map((day) => {
              const hasData = daysWithData.has(day);
              return (
                <Button
                  key={day}
                  variant={hasData ? "default" : "outline"}
                  className={`h-10 sm:h-12 text-sm sm:text-base font-semibold ${
                    hasData 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-primary hover:text-primary-foreground"
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  {day}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDay && (
        <DayDetailsDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          day={selectedDay}
          month={currentMonth}
          year={currentYear}
          onSave={handleSave}
          initialIncomes={dayIncomes}
          initialExpenses={dayExpenses}
          incomeCategories={finalIncomeCategories}
          expenseCategories={finalExpenseCategories}
        />
      )}
    </>
  );
}
