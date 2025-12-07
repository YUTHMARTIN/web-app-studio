import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon, XIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  user_id: string;
  created_at: string;
}

interface CategoryManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'INCOME' | 'EXPENSE';
  userId: string;
  dashboardId: string | null;
  onCategoriesChange: () => void;
}

export function CategoryManagerDialog({
  open,
  onOpenChange,
  type,
  userId,
  dashboardId,
  onCategoriesChange,
}: CategoryManagerDialogProps) {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open, type, userId]);

  const fetchCategories = async () => {
    if (!dashboardId) return;
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .eq('dashboard_id', dashboardId)
      .order('name');

    if (error) {
      toast.error('Failed to load categories');
    } else {
      setCategories((data || []).map(d => ({
        ...d,
        type: d.type as 'INCOME' | 'EXPENSE'
      })));
    }
  };

  const handleAdd = async () => {
    if (!newCategory.trim() || !dashboardId) return;
    setLoading(true);

    const { error } = await supabase.from('categories').insert({
      user_id: userId,
      name: newCategory.trim(),
      type: type,
      dashboard_id: dashboardId,
    });

    if (error) {
      if (error.code === '23505') {
        toast.error('Category already exists');
      } else {
        toast.error('Failed to add category');
      }
    } else {
      setNewCategory('');
      fetchCategories();
      onCategoriesChange();
      toast.success('Category added');
    }
    setLoading(false);
  };

  const handleEdit = async (id: string) => {
    if (!editValue.trim()) return;
    setLoading(true);

    const { error } = await supabase
      .from('categories')
      .update({ name: editValue.trim() })
      .eq('id', id);

    if (error) {
      if (error.code === '23505') {
        toast.error('Category already exists');
      } else {
        toast.error('Failed to update category');
      }
    } else {
      setEditingId(null);
      fetchCategories();
      onCategoriesChange();
      toast.success('Category updated');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);

    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete category');
    } else {
      fetchCategories();
      onCategoriesChange();
      toast.success('Category deleted');
    }
    setLoading(false);
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditValue(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'INCOME' ? t('category.manageIncome') : t('category.manageExpense')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new category */}
          <div className="flex gap-2">
            <Input
              placeholder={t('category.newPlaceholder')}
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd} disabled={loading || !newCategory.trim()}>
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Category list */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('category.noCategories')}
              </p>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-2 p-2 rounded-md bg-muted"
                >
                  {editingId === category.id ? (
                    <>
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEdit(category.id);
                          if (e.key === 'Escape') cancelEditing();
                        }}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(category.id)}
                        disabled={loading}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={cancelEditing}>
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1">{category.name}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEditing(category)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(category.id)}
                        disabled={loading}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('dialog.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
