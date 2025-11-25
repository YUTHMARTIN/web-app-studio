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

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setDialogOpen(true);
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
        />
      )}
    </>
  );
}
