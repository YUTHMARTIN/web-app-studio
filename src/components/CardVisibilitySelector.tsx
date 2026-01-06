import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings2Icon } from 'lucide-react';

export type VisibleCards = {
  income: boolean;
  expense: boolean;
  profit: boolean;
};

interface CardVisibilitySelectorProps {
  visibleCards: VisibleCards;
  onVisibilityChange: (cards: VisibleCards) => void;
}

export function CardVisibilitySelector({
  visibleCards,
  onVisibilityChange,
}: CardVisibilitySelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Settings2Icon className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuCheckboxItem
          checked={visibleCards.income}
          onCheckedChange={(checked) =>
            onVisibilityChange({ ...visibleCards, income: checked })
          }
        >
          Total Income
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={visibleCards.expense}
          onCheckedChange={(checked) =>
            onVisibilityChange({ ...visibleCards, expense: checked })
          }
        >
          Total Expense
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={visibleCards.profit}
          onCheckedChange={(checked) =>
            onVisibilityChange({ ...visibleCards, profit: checked })
          }
        >
          Net Profit
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}