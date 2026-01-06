import { useState } from 'react';
import { Transaction } from '@/types/finance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { PencilIcon } from 'lucide-react';
import { CategoryManagerDialog } from './CategoryManagerDialog';
import { CategoryTransactionsDialog } from './CategoryTransactionsDialog';

interface ExpenseChartProps {
  transactions: Transaction[];
  userId: string;
  dashboardId: string | null;
  onCategoriesChange: () => void;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function ExpenseChart({ transactions, userId, dashboardId, onCategoriesChange }: ExpenseChartProps) {
  const { t } = useLanguage();
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [transactionsDialogOpen, setTransactionsDialogOpen] = useState(false);
  
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

  const totalIncome = Object.values(incomeByCategory).reduce((sum, val) => sum + val, 0);
  const totalExpense = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0);

  const incomePieData = Object.entries(incomeByCategory).map(([name, value]) => ({
    name,
    value,
    percent: totalIncome > 0 ? (value / totalIncome) * 100 : 0,
  }));

  const expensePieData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
    percent: totalExpense > 0 ? (value / totalExpense) * 100 : 0,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const handlePieClick = (data: any, type: 'INCOME' | 'EXPENSE') => {
    if (data && data.name) {
      setSelectedCategory(data.name);
      setSelectedType(type);
      setTransactionsDialogOpen(true);
    }
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label if less than 5%

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-semibold"
        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
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
                  label={renderCustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={(data) => handlePieClick(data, 'INCOME')}
                  style={{ cursor: 'pointer' }}
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
                  label={renderCustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={(data) => handlePieClick(data, 'EXPENSE')}
                  style={{ cursor: 'pointer' }}
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
        dashboardId={dashboardId}
        onCategoriesChange={onCategoriesChange}
      />

      <CategoryManagerDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        type="EXPENSE"
        userId={userId}
        dashboardId={dashboardId}
        onCategoriesChange={onCategoriesChange}
      />

      {selectedCategory && (
        <CategoryTransactionsDialog
          open={transactionsDialogOpen}
          onOpenChange={setTransactionsDialogOpen}
          category={selectedCategory}
          transactions={transactions}
          type={selectedType}
        />
      )}
    </>
  );
}