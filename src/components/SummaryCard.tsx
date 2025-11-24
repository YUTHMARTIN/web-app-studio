import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'profit';
}

export function SummaryCard({ title, amount, type }: SummaryCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const icons = {
    income: ArrowUpIcon,
    expense: ArrowDownIcon,
    profit: TrendingUpIcon,
  };

  const Icon = icons[type];

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all hover:shadow-lg",
      type === 'income' && "border-income/20 bg-gradient-to-br from-income-light to-card",
      type === 'expense' && "border-expense/20 bg-gradient-to-br from-expense-light to-card",
      type === 'profit' && "border-profit/20 bg-gradient-to-br from-profit-light to-card"
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn(
              "text-3xl font-bold",
              type === 'income' && "text-income",
              type === 'expense' && "text-expense",
              type === 'profit' && "text-profit"
            )}>
              {formatCurrency(amount)}
            </p>
          </div>
          <div className={cn(
            "rounded-full p-3",
            type === 'income' && "bg-income/10",
            type === 'expense' && "bg-expense/10",
            type === 'profit' && "bg-profit/10"
          )}>
            <Icon className={cn(
              "h-6 w-6",
              type === 'income' && "text-income",
              type === 'expense' && "text-expense",
              type === 'profit' && "text-profit"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
