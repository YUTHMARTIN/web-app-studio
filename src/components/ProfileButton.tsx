import { useState, useEffect } from 'react';
import { User, LogOutIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { ConfirmDialog } from './ConfirmDialog';
import { useNavigate } from 'react-router-dom';

interface ProfileButtonProps {
  userId: string;
  onUsernameChange: (username: string) => void;
}

export function ProfileButton({ userId, onUsernameChange }: ProfileButtonProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, email')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    if (data) {
      setUsername(data.username || '');
      setEmail(data.email || '');
      setEditedUsername(data.username || '');
      onUsernameChange(data.username || '');
    } else {
      // Profile doesn't exist for existing user, create one
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.email) {
        const defaultUsername = userData.user.email.split('@')[0];
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId, email: userData.user.email, username: defaultUsername });
        
        if (!insertError) {
          setEmail(userData.user.email);
          setUsername(defaultUsername);
          setEditedUsername(defaultUsername);
          onUsernameChange(defaultUsername);
        }
      }
    }
  };

  const handleSave = async () => {
    if (!editedUsername.trim()) {
      toast.error(t('usernameRequired'));
      return;
    }

    setIsLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ username: editedUsername.trim() })
      .eq('id', userId);

    setIsLoading(false);

    if (error) {
      toast.error(t('updateFailed'));
      console.error('Error updating username:', error);
      return;
    }

    setUsername(editedUsername.trim());
    onUsernameChange(editedUsername.trim());
    setIsEditing(false);
    toast.success(t('profileUpdated'));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <User className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <div className="space-y-4">
            <h4 className="font-medium">{t('profile')}</h4>
            
            <div className="space-y-2">
              <Label>{t('email')}</Label>
              <p className="text-sm text-muted-foreground break-all">{email}</p>
            </div>

            <div className="space-y-2">
              <Label>{t('username')}</Label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    value={editedUsername}
                    onChange={(e) => setEditedUsername(e.target.value)}
                    placeholder={t('enterUsername')}
                    className="h-8"
                  />
                  <Button size="sm" onClick={handleSave} disabled={isLoading}>
                    {t('save')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setIsEditing(false);
                    setEditedUsername(username);
                  }}>
                    {t('cancel')}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm">{username || '-'}</p>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                    {t('edit')}
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            <Button
              variant="outline"
              size="sm"
              className="w-full text-destructive hover:text-destructive"
              onClick={() => setLogoutConfirmOpen(true)}
            >
              <LogOutIcon className="h-4 w-4 mr-2" />
              Leave
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title="Leave"
        description="Are you sure you want to log out?"
        confirmLabel="Leave"
        cancelLabel="Cancel"
        onConfirm={handleLogout}
      />
    </>
  );
}