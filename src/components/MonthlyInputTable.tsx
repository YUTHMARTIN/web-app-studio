import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DayDetailsDialog } from './DayDetailsDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MonthlyInputTableProps {
  currentMonth: number;
  currentYear: number;
  onDataChange: () => void;
}

export function MonthlyInputTable({ currentMonth, currentYear, onDataChange }: MonthlyInputTableProps) {
  const { t } = useLanguage();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dayIncomes, setDayIncomes] = useState<Array<{ amount: string; category: string }>>([]);
  const [dayExpenses, setDayExpenses] = useState<Array<{ amount: string; category: string }>>([]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

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
      .eq('date', dateStr);

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
    
    // First, delete existing transactions for this day
    await supabase
      .from('transactions')
      .delete()
      .eq('user_id', user.id)
      .eq('date', dateStr);
    
    const transactions = [
      ...incomes
        .filter(item => item.amount && parseFloat(item.amount) > 0 && item.category)
        .map(item => ({
          user_id: user.id,
          date: dateStr,
          type: 'INCOME',
          category: item.category,
          amount: parseFloat(item.amount),
          description: `Income on ${dateStr}`,
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
        })),
    ];

    if (transactions.length === 0) {
      toast.error('Please add at least one income or expense entry');
      return;
    }

    const { error } = await supabase.from('transactions').insert(transactions);

    if (error) {
      toast.error('Error saving transactions: ' + error.message);
    } else {
      toast.success(`Saved ${transactions.length} transactions!`);
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {monthNames[currentMonth]} {currentYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => (
              <Button
                key={day}
                variant="outline"
                className="h-14 text-lg font-semibold hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleDayClick(day)}
              >
                {day}
              </Button>
            ))}
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
        />
      )}
    </>
  );
}
