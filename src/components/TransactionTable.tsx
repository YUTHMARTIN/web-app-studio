import { Transaction } from '@/types/finance';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
}

export function TransactionTable({ transactions, onDelete }: TransactionTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            {onDelete && <TableHead className="w-[80px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">{formatDate(transaction.date)}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    transaction.type === 'INCOME'
                      ? 'border-income bg-income-light text-income'
                      : 'border-expense bg-expense-light text-expense'
                  )}
                >
                  {transaction.type}
                </Badge>
              </TableCell>
              <TableCell>{transaction.category}</TableCell>
              <TableCell className="text-muted-foreground">{transaction.description}</TableCell>
              <TableCell className={cn(
                "text-right font-semibold",
                transaction.type === 'INCOME' ? 'text-income' : 'text-expense'
              )}>
                {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </TableCell>
              {onDelete && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(transaction.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
