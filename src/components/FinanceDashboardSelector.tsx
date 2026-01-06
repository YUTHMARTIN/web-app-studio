import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDownIcon, PlusIcon, PencilIcon, CheckIcon, TrashIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { ConfirmDialog } from './ConfirmDialog';

interface FinanceDashboard {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

interface FinanceDashboardSelectorProps {
  userId: string;
  selectedDashboardId: string | null;
  onDashboardChange: (dashboardId: string, dashboardName: string) => void;
}

export function FinanceDashboardSelector({
  userId,
  selectedDashboardId,
  onDashboardChange,
}: FinanceDashboardSelectorProps) {
  const { t } = useLanguage();
  const [dashboards, setDashboards] = useState<FinanceDashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState<FinanceDashboard | null>(null);
  const [newName, setNewName] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [dashboardToDelete, setDashboardToDelete] = useState<FinanceDashboard | null>(null);

  const fetchDashboards = async () => {
    const { data, error } = await supabase
      .from('finance_dashboards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error(t('dashboard.failed'));
    } else {
      const fetchedDashboards = (data || []) as FinanceDashboard[];
      setDashboards(fetchedDashboards);
      
      // If no dashboards exist, create "Main" as default
      if (fetchedDashboards.length === 0) {
        await createDefaultDashboard();
      } else if (!selectedDashboardId) {
        // Select the first dashboard if none selected
        onDashboardChange(fetchedDashboards[0].id, fetchedDashboards[0].name);
      }
    }
    setLoading(false);
  };

  const createDefaultDashboard = async () => {
    const { data, error } = await supabase
      .from('finance_dashboards')
      .insert({ user_id: userId, name: 'Main' })
      .select()
      .single();

    if (!error && data) {
      const newDashboard = data as FinanceDashboard;
      setDashboards([newDashboard]);
      onDashboardChange(newDashboard.id, newDashboard.name);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchDashboards();
    }
  }, [userId]);

  const handleAddDashboard = async () => {
    if (!newName.trim()) return;

    const { data, error } = await supabase
      .from('finance_dashboards')
      .insert({ user_id: userId, name: newName.trim() })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        toast.error(t('dashboard.exists'));
      } else {
        toast.error(t('dashboard.createFailed'));
      }
    } else {
      toast.success(t('dashboard.created'));
      setNewName('');
      setDialogOpen(false);
      fetchDashboards();
    }
  };

  const handleRenameDashboard = async () => {
    if (!editingDashboard || !newName.trim()) return;

    const { error } = await supabase
      .from('finance_dashboards')
      .update({ name: newName.trim() })
      .eq('id', editingDashboard.id);

    if (error) {
      if (error.code === '23505') {
        toast.error(t('dashboard.exists'));
      } else {
        toast.error(t('dashboard.renameFailed'));
      }
    } else {
      toast.success(t('dashboard.renamed'));
      setNewName('');
      setEditingDashboard(null);
      setDialogOpen(false);
      fetchDashboards();
      
      // Update name if currently selected
      if (selectedDashboardId === editingDashboard.id) {
        onDashboardChange(editingDashboard.id, newName.trim());
      }
    }
  };

  const handleDeleteDashboard = async () => {
    if (!dashboardToDelete) return;

    // First delete all related transactions
    await supabase
      .from('transactions')
      .delete()
      .eq('dashboard_id', dashboardToDelete.id);

    // Then delete all related categories
    await supabase
      .from('categories')
      .delete()
      .eq('dashboard_id', dashboardToDelete.id);

    // Finally delete the dashboard
    const { error } = await supabase
      .from('finance_dashboards')
      .delete()
      .eq('id', dashboardToDelete.id);

    if (error) {
      toast.error('Failed to delete dashboard');
    } else {
      toast.success('Dashboard deleted');
      setDeleteConfirmOpen(false);
      setDashboardToDelete(null);
      
      // If we deleted the selected dashboard, select another one
      if (selectedDashboardId === dashboardToDelete.id) {
        const remaining = dashboards.filter(d => d.id !== dashboardToDelete.id);
        if (remaining.length > 0) {
          onDashboardChange(remaining[0].id, remaining[0].name);
        }
      }
      
      fetchDashboards();
    }
  };

  const openAddDialog = () => {
    setEditingDashboard(null);
    setNewName('');
    setDialogOpen(true);
  };

  const openRenameDialog = (dashboard: FinanceDashboard, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDashboard(dashboard);
    setNewName(dashboard.name);
    setDialogOpen(true);
  };

  const openDeleteConfirm = (dashboard: FinanceDashboard, e: React.MouseEvent) => {
    e.stopPropagation();
    setDashboardToDelete(dashboard);
    setDeleteConfirmOpen(true);
  };

  const selectedDashboard = dashboards.find(d => d.id === selectedDashboardId);

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled className="h-9">
        {t('dashboard.loading')}
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1">
            <span className="max-w-[120px] truncate">{selectedDashboard?.name || t('dashboard.select')}</span>
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-popover">
          {dashboards.map((dashboard) => (
            <DropdownMenuItem
              key={dashboard.id}
              className="flex items-center justify-between cursor-pointer"
              onClick={() => onDashboardChange(dashboard.id, dashboard.name)}
            >
              <span className={selectedDashboardId === dashboard.id ? 'font-semibold' : ''}>
                {dashboard.name}
              </span>
              <div className="flex items-center gap-1">
                {selectedDashboardId === dashboard.id && (
                  <CheckIcon className="h-4 w-4 text-primary" />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => openRenameDialog(dashboard, e)}
                >
                  <PencilIcon className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={(e) => openDeleteConfirm(dashboard, e)}
                >
                  <TrashIcon className="h-3 w-3" />
                </Button>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={openAddDialog} className="cursor-pointer">
            <PlusIcon className="h-4 w-4 mr-2" />
            {t('dashboard.addNew')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editingDashboard ? t('dashboard.rename') : t('dashboard.add')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dashboard-name">{t('dashboard.name')}</Label>
              <Input
                id="dashboard-name"
                placeholder={t('dashboard.namePlaceholder')}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    editingDashboard ? handleRenameDashboard() : handleAddDashboard();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={editingDashboard ? handleRenameDashboard : handleAddDashboard}>
              {editingDashboard ? t('dashboard.renameBtn') : t('dashboard.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Dashboard"
        description={`Are you sure you want to delete "${dashboardToDelete?.name}"? This will also delete all transactions and categories in this dashboard. This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteDashboard}
        variant="destructive"
      />
    </>
  );
}