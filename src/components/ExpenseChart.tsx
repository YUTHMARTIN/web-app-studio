import { useState } from 'react';
import { Transaction } from '@/types/finance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { PencilIcon } from 'lucide-react';
import { CategoryManagerDialog } from './CategoryManagerDialog';

interface ExpenseChartProps {
  transactions: Transaction[];
  userId: string;
  onCategoriesChange: () => void;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function ExpenseChart({ transactions, userId, onCategoriesChange }: ExpenseChartProps) {
  const { t } = useLanguage();
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  
  // Group income by category
  const incomeByCategory = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  // Group expenses by category
  const expensesByCategory = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const incomePieData = Object.entries(incomeByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const expensePieData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>{t('chart.incomeDistribution')}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIncomeDialogOpen(true)}
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              {t('category.edit')}
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incomePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>{t('chart.expenseDistribution')}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpenseDialogOpen(true)}
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              {t('category.edit')}
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <CategoryManagerDialog
        open={incomeDialogOpen}
        onOpenChange={setIncomeDialogOpen}
        type="INCOME"
        userId={userId}
        onCategoriesChange={onCategoriesChange}
      />

      <CategoryManagerDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        type="EXPENSE"
        userId={userId}
        onCategoriesChange={onCategoriesChange}
      />
    </>
  );
}
