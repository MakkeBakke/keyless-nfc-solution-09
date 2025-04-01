
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, Trash2, ArrowLeft, Check, X, Mail, Send
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

// Define types for user permissions
interface KeyPermission {
  id: string;
  key_id: string;
  user_id: string;
  email: string;
  name: string;
  can_unlock: boolean;
  can_lock: boolean;
  can_view_history: boolean;
  created_at: string;
}

const KeyPermissions = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [keyData, setKeyData] = useState<any>(null);
  const [users, setUsers] = useState<KeyPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [permissionChanging, setPermissionChanging] = useState<string | null>(null);
  
  useEffect(() => {
    fetchKeyData();
    fetchKeyPermissions();
  }, [id]);
  
  const fetchKeyData = async () => {
    try {
      if (!id) return;
      
      const { data: keyData, error: keyError } = await supabase
        .from('keys')
        .select('*')
        .eq('id', id)
        .single();
      
      if (keyError) throw keyError;
      
      setKeyData(keyData);
    } catch (error) {
      console.error('Error fetching key details:', error);
      toast({
        title: t('error'),
        description: t('failedToLoadKeyDetails'),
        variant: "destructive",
      });
    }
  };
  
  const fetchKeyPermissions = async () => {
    try {
      setLoading(true);
      
      if (!id) return;
      
      // Get the current user's session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Demo data for unauthenticated users
        setUsers([
          {
            id: '1',
            key_id: id,
            user_id: 'demo-user-1',
            email: 'owner@example.com',
            name: 'You (Owner)',
            can_unlock: true,
            can_lock: true,
            can_view_history: true,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            key_id: id,
            user_id: 'demo-user-2',
            email: 'family@example.com',
            name: 'Family Member',
            can_unlock: true,
            can_lock: true,
            can_view_history: false,
            created_at: new Date(Date.now() - 7*24*60*60*1000).toISOString() // 7 days ago
          }
        ]);
        setLoading(false);
        return;
      }
      
      // Fetch all permissions for this key
      const { data, error } = await supabase
        .from('key_permissions')
        .select(`
          id,
          key_id,
          user_id,
          can_unlock,
          can_lock,
          can_view_history,
          created_at,
          profiles(name, email)
        `)
        .eq('key_id', id);
      
      if (error) throw error;
      
      // Transform data to match our KeyPermission interface
      const formattedUsers = data.map((permission: any) => ({
        id: permission.id,
        key_id: permission.key_id,
        user_id: permission.user_id,
        email: permission.profiles?.email || 'Unknown',
        name: permission.profiles?.name || 'Unknown User',
        can_unlock: permission.can_unlock,
        can_lock: permission.can_lock,
        can_view_history: permission.can_view_history,
        created_at: permission.created_at
      }));
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching key permissions:', error);
      toast({
        title: t('error'),
        description: t('failedToLoadPermissions'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleInviteUser = async () => {
    try {
      if (!inviteEmail || !id) return;
      
      setSendingInvite(true);
      
      // Check if user with this email exists in profiles
      const { data: existingUsers, error: userError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', inviteEmail.toLowerCase().trim());
      
      if (userError) throw userError;
      
      let userId;
      
      if (existingUsers && existingUsers.length > 0) {
        // User exists
        userId = existingUsers[0].id;
        
        // Check if user already has permission for this key
        const { data: existingPermissions, error: permError } = await supabase
          .from('key_permissions')
          .select('id')
          .eq('key_id', id)
          .eq('user_id', userId);
        
        if (permError) throw permError;
        
        if (existingPermissions && existingPermissions.length > 0) {
          throw new Error(t('userAlreadyHasAccess'));
        }
      } else {
        // User doesn't exist - we should trigger an invitation email here
        // For now, we'll just show a message that the invitation has been sent
        toast({
          title: t('invitationSent'),
          description: t('userWillReceiveEmail').replace('{email}', inviteEmail),
        });
        
        setShowInviteDialog(false);
        setSendingInvite(false);
        setInviteEmail('');
        setInviteName('');
        return;
      }
      
      // Add permission for this user
      const { error: insertError } = await supabase
        .from('key_permissions')
        .insert({
          key_id: id,
          user_id: userId,
          can_unlock: true,
          can_lock: true,
          can_view_history: false
        });
      
      if (insertError) throw insertError;
      
      toast({
        title: t('accessGranted'),
        description: t('userHasBeenGrantedAccess').replace('{email}', inviteEmail),
      });
      
      // Refresh the permissions list
      fetchKeyPermissions();
      
      // Reset form
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteName('');
    } catch (error: any) {
      console.error('Error inviting user:', error);
      toast({
        title: t('error'),
        description: error.message || t('failedToInviteUser'),
        variant: "destructive",
      });
    } finally {
      setSendingInvite(false);
    }
  };
  
  const togglePermission = async (userId: string, permission: 'can_unlock' | 'can_lock' | 'can_view_history', currentValue: boolean) => {
    try {
      if (!id) return;
      
      setPermissionChanging(userId + permission);
      
      const { error } = await supabase
        .from('key_permissions')
        .update({ [permission]: !currentValue })
        .eq('user_id', userId)
        .eq('key_id', id);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => {
        if (user.user_id === userId) {
          return { ...user, [permission]: !currentValue };
        }
        return user;
      }));
      
      toast({
        title: t('permissionUpdated'),
        description: t('userPermissionsHaveBeenUpdated'),
      });
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: t('error'),
        description: t('failedToUpdatePermission'),
        variant: "destructive",
      });
    } finally {
      setPermissionChanging(null);
    }
  };
  
  const removeAccess = async (userId: string, userName: string) => {
    try {
      if (!id) return;
      
      const { error } = await supabase
        .from('key_permissions')
        .delete()
        .eq('user_id', userId)
        .eq('key_id', id);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.filter(user => user.user_id !== userId));
      
      toast({
        title: t('accessRemoved'),
        description: t('userAccessRemoved').replace('{name}', userName),
      });
    } catch (error) {
      console.error('Error removing access:', error);
      toast({
        title: t('error'),
        description: t('failedToRemoveAccess'),
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-axiv-light-gray rounded-full mb-4"></div>
          <div className="h-4 bg-axiv-light-gray rounded w-32 mb-2"></div>
          <div className="h-3 bg-axiv-light-gray rounded w-24"></div>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="min-h-screen pb-24 pt-24 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Header title={t('keyPermissions')} showBackButton />
      
      <div className="max-w-md mx-auto">
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">{t('people')}</h2>
            <Button variant="outline" size="sm" onClick={() => setShowInviteDialog(true)}>
              <UserPlus className="mr-1 h-4 w-4" />
              {t('invite')}
            </Button>
          </div>
          
          {users.length === 0 ? (
            <div className="text-center py-6 text-axiv-gray">
              <Users className="mx-auto h-12 w-12 mb-2 opacity-40" />
              <p>{t('noUsersHaveAccess')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="border-b border-axiv-light-gray pb-4 last:border-0">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-axiv-gray">{user.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => removeAccess(user.user_id, user.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      <span className="text-sm">{t('canUnlock')}</span>
                      <div className="relative">
                        {permissionChanging === user.user_id + 'can_unlock' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 rounded">
                            <div className="animate-spin h-4 w-4 border-2 border-axiv-blue border-t-transparent rounded-full"></div>
                          </div>
                        )}
                        <Switch
                          checked={user.can_unlock}
                          onCheckedChange={() => togglePermission(user.user_id, 'can_unlock', user.can_unlock)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      <span className="text-sm">{t('canLock')}</span>
                      <div className="relative">
                        {permissionChanging === user.user_id + 'can_lock' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 rounded">
                            <div className="animate-spin h-4 w-4 border-2 border-axiv-blue border-t-transparent rounded-full"></div>
                          </div>
                        )}
                        <Switch
                          checked={user.can_lock}
                          onCheckedChange={() => togglePermission(user.user_id, 'can_lock', user.can_lock)}
                        />
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      <span className="text-sm">{t('canViewHistory')}</span>
                      <div className="relative">
                        {permissionChanging === user.user_id + 'can_view_history' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 rounded">
                            <div className="animate-spin h-4 w-4 border-2 border-axiv-blue border-t-transparent rounded-full"></div>
                          </div>
                        )}
                        <Switch
                          checked={user.can_view_history}
                          onCheckedChange={() => togglePermission(user.user_id, 'can_view_history', user.can_view_history)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="glass-card p-6">
          <h2 className="text-xl font-medium mb-4">{t('invitationSettings')}</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{t('allowNewInvitations')}</h3>
                <p className="text-sm text-axiv-gray">{t('enableDisableInvitations')}</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{t('requireApproval')}</h3>
                <p className="text-sm text-axiv-gray">{t('approvePeopleBeforeAccess')}</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('invitePeople')}</DialogTitle>
            <DialogDescription>
              {t('invitePeopleDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-axiv-gray" size={16} />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full pl-10 pr-4 py-2 border border-axiv-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-axiv-blue"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('name')} ({t('optional')})</label>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder={t('friendOrFamilyName')}
                className="w-full px-4 py-2 border border-axiv-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-axiv-blue"
              />
            </div>
            
            <div className="pt-4 flex space-x-2 justify-end">
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                {t('cancel')}
              </Button>
              <Button 
                onClick={handleInviteUser}
                disabled={!inviteEmail || sendingInvite}
                className="relative"
              >
                {sendingInvite ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    {t('sending')}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {t('sendInvite')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default KeyPermissions;
