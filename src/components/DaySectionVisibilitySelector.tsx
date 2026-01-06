import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings2Icon } from 'lucide-react';

export type VisibleDaySections = {
  income: boolean;
  expense: boolean;
  profit: boolean;
};

interface DaySectionVisibilitySelectorProps {
  visibleSections: VisibleDaySections;
  onVisibilityChange: (sections: VisibleDaySections) => void;
}

export function DaySectionVisibilitySelector({
  visibleSections,
  onVisibilityChange,
}: DaySectionVisibilitySelectorProps) {
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
          checked={visibleSections.income}
          onCheckedChange={(checked) =>
            onVisibilityChange({ ...visibleSections, income: checked })
          }
        >
          Income
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={visibleSections.expense}
          onCheckedChange={(checked) =>
            onVisibilityChange({ ...visibleSections, expense: checked })
          }
        >
          Expense
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={visibleSections.profit}
          onCheckedChange={(checked) =>
            onVisibilityChange({ ...visibleSections, profit: checked })
          }
        >
          Profit
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}