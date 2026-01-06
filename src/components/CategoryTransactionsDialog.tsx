import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Transaction } from '@/types/finance';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CategoryTransactionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: string;
  transactions: Transaction[];
  type: 'INCOME' | 'EXPENSE';
}

export function CategoryTransactionsDialog({
  open,
  onOpenChange,
  category,
  transactions,
  type,
}: CategoryTransactionsDialogProps) {
  const filteredTransactions = transactions
    .filter(t => t.category === category && t.type === type)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{category}</span>
            <span className={type === 'INCOME' ? 'text-income' : 'text-expense'}>
              {formatCurrency(total)}
            </span>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-2">
            {filteredTransactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-md"
              >
                <span className="text-sm text-muted-foreground">
                  {formatDate(t.date)}
                </span>
                <span className={`font-medium ${type === 'INCOME' ? 'text-income' : 'text-expense'}`}>
                  {formatCurrency(t.amount)}
                </span>
              </div>
            ))}
            {filteredTransactions.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No transactions found
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}