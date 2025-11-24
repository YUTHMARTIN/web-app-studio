import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CalendarIcon } from 'lucide-react';
import { Transaction } from '@/types/finance';
import { toast } from 'sonner';

interface DailyEntry {
  day: number;
  income: string;
  expense: string;
  incomeCategory: string;
  expenseCategory: string;
}

interface MonthlyInputTableProps {
  onAddTransactions: (transactions: Omit<Transaction, 'id'>[]) => void;
  currentMonth: number;
  currentYear: number;
}

export function MonthlyInputTable({ onAddTransactions, currentMonth, currentYear }: MonthlyInputTableProps) {
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const [entries, setEntries] = useState<DailyEntry[]>(
    Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      income: '',
      expense: '',
      incomeCategory: '',
      expenseCategory: '',
    }))
  );

  const updateEntry = (day: number, field: keyof DailyEntry, value: string) => {
    setEntries(prev =>
      prev.map(entry =>
        entry.day === day ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleSubmit = () => {
    const transactions: Omit<Transaction, 'id'>[] = [];
    
    entries.forEach(entry => {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(entry.day).padStart(2, '0')}`;
      
      if (entry.income && parseFloat(entry.income) > 0) {
        transactions.push({
          date: dateStr,
          type: 'INCOME',
          category: entry.incomeCategory || 'Income',
          amount: parseFloat(entry.income),
          description: `Income on day ${entry.day}`,
        });
      }
      
      if (entry.expense && parseFloat(entry.expense) > 0) {
        transactions.push({
          date: dateStr,
          type: 'EXPENSE',
          category: entry.expenseCategory || 'Expense',
          amount: parseFloat(entry.expense),
          description: `Expense on day ${entry.day}`,
        });
      }
    });

    if (transactions.length === 0) {
      toast.error('Please add at least one income or expense entry');
      return;
    }

    onAddTransactions(transactions);
    
    // Reset entries
    setEntries(
      Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        income: '',
        expense: '',
        incomeCategory: '',
        expenseCategory: '',
      }))
    );
    
    toast.success(`Added ${transactions.length} transactions`);
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleString('en-US', { month: 'long' });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Monthly Input - {monthName} {currentYear}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-auto max-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Day</TableHead>
                <TableHead>Income ($)</TableHead>
                <TableHead>Income Category</TableHead>
                <TableHead>Expense ($)</TableHead>
                <TableHead>Expense Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.day}>
                  <TableCell className="font-medium">{entry.day}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={entry.income}
                      onChange={(e) => updateEntry(entry.day, 'income', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      placeholder="e.g., Salary"
                      value={entry.incomeCategory}
                      onChange={(e) => updateEntry(entry.day, 'incomeCategory', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={entry.expense}
                      onChange={(e) => updateEntry(entry.day, 'expense', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      placeholder="e.g., Groceries"
                      value={entry.expenseCategory}
                      onChange={(e) => updateEntry(entry.day, 'expenseCategory', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4">
          <Button onClick={handleSubmit} className="w-full">
            Save All Entries
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
