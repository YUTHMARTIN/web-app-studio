import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface EntryItem {
  amount: string;
  category: string;
}

interface DayDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: number;
  month: number;
  year: number;
  onSave: (incomes: EntryItem[], expenses: EntryItem[]) => void;
}

const INCOME_CATEGORIES = ['Income A', 'Income B', 'Income C', 'Income D'];
const EXPENSE_CATEGORIES = ['Expense A', 'Expense B', 'Expense C', 'Expense D'];

export function DayDetailsDialog({
  open,
  onOpenChange,
  day,
  month,
  year,
  onSave,
}: DayDetailsDialogProps) {
  const { t } = useLanguage();
  const [incomes, setIncomes] = useState<EntryItem[]>([{ amount: '', category: '' }]);
  const [expenses, setExpenses] = useState<EntryItem[]>([{ amount: '', category: '' }]);

  const addIncome = () => {
    setIncomes([...incomes, { amount: '', category: '' }]);
  };

  const removeIncome = (index: number) => {
    setIncomes(incomes.filter((_, i) => i !== index));
  };

  const updateIncome = (index: number, field: keyof EntryItem, value: string) => {
    const updated = [...incomes];
    updated[index][field] = value;
    setIncomes(updated);
  };

  const addExpense = () => {
    setExpenses([...expenses, { amount: '', category: '' }]);
  };

  const removeExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const updateExpense = (index: number, field: keyof EntryItem, value: string) => {
    const updated = [...expenses];
    updated[index][field] = value;
    setExpenses(updated);
  };

  const handleSave = () => {
    onSave(incomes, expenses);
    setIncomes([{ amount: '', category: '' }]);
    setExpenses([{ amount: '', category: '' }]);
    onOpenChange(false);
  };

  const totalIncome = incomes.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalExpense = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const profit = totalIncome - totalExpense;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {monthNames[month]} {day}, {year}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Income</p>
              <p className="text-xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expense</p>
              <p className="text-xl font-bold text-red-600">${totalExpense.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Profit</p>
              <p className={`text-xl font-bold ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                ${profit.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Income Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Income</h3>
              <Button type="button" size="sm" onClick={addIncome}>
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Income
              </Button>
            </div>
            {incomes.map((income, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={income.amount}
                    onChange={(e) => updateIncome(index, 'amount', e.target.value)}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={income.category}
                    onValueChange={(value) => updateIncome(index, 'category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {INCOME_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {incomes.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIncome(index)}
                    className="mt-8"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Expense Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Expense</h3>
              <Button type="button" size="sm" onClick={addExpense}>
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Expense
              </Button>
            </div>
            {expenses.map((expense, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={expense.amount}
                    onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={expense.category}
                    onValueChange={(value) => updateExpense(index, 'category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {expenses.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeExpense(index)}
                    className="mt-8"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
