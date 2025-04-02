
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, UserCheck, ChevronRight, ArrowLeft, Trash, X, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { KeyPermission, getKeyPermissions, addKeyPermission, updateKeyPermission, removeKeyPermission } from '@/utils/localStorageUtils';

const KeyPermissions = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [keyData, setKeyData] = useState<any>(null);
  const [permissions, setPermissions] = useState<KeyPermission[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [canUnlock, setCanUnlock] = useState(true);
  const [canLock, setCanLock] = useState(true);
  const [canViewHistory, setCanViewHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [allowInvitations, setAllowInvitations] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        // For demo purposes, set a fake user ID
        setUserId('demo-user-id');
      }
    };
    
    checkSession();
  }, []);

  useEffect(() => {
    if (!id || !userId) return;
    
    const fetchKeyData = async () => {
      setLoading(true);
      
      try {
        // Fetch key data from database
        const { data, error } = await supabase
          .from('keys')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          // For demo, provide mock data if there's an error
          setKeyData({
            id,
            name: 'Demo Key',
            type: 'Smart Lock',
            battery_level: 75,
            is_active: true,
            is_locked: true
          });
        } else {
          setKeyData(data);
        }
        
        // Get permissions from local storage
        const keyPermissions = getKeyPermissions(id);
        setPermissions(keyPermissions);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: t('error'),
          description: t('failedToLoadPermissions'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchKeyData();
  }, [id, userId, t]);
  
  const handleInviteUser = async () => {
    if (!inviteEmail || !id || !userId) return;
    
    setIsSending(true);
    
    try {
      // Check if user already has permission
      const existingPermission = permissions.find(p => p.user_email === inviteEmail);
      
      if (existingPermission) {
        toast({
          title: t('error'),
          description: t('userAlreadyHasAccess'),
          variant: "destructive",
        });
      } else {
        // Add new permission to localStorage
        addKeyPermission(
          id,
          'generated-id-' + Date.now(), // Simulate a user ID
          inviteEmail,
          inviteName || inviteEmail.split('@')[0],
          canUnlock,
          canLock,
          canViewHistory
        );
        
        toast({
          title: t('invitationSent'),
          description: t('userWillReceiveEmail'),
        });
        
        // Refresh permissions
        setPermissions(getKeyPermissions(id));
        
        // Clear the form
        setInviteEmail('');
        setInviteName('');
        setIsInviteModalOpen(false);
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: t('error'),
        description: t('failedToInviteUser'),
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const handleUpdatePermission = async (permission: KeyPermission, field: keyof KeyPermission, value: boolean) => {
    try {
      const updatedPermission = { ...permission, [field]: value };
      updateKeyPermission(id!, updatedPermission);
      
      // Refresh permissions
      setPermissions(getKeyPermissions(id!));
      
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
    }
  };
  
  const handleRemovePermission = async (permissionId: string) => {
    try {
      removeKeyPermission(id!, permissionId);
      
      // Refresh permissions
      setPermissions(getKeyPermissions(id!));
      
      toast({
        title: t('accessRemoved'),
        description: t('userAccessRemoved'),
      });
    } catch (error) {
      console.error('Error removing permission:', error);
      toast({
        title: t('error'),
        description: t('failedToRemoveAccess'),
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 pt-24 px-4">
        <Header title={t('permissions')} showBackButton />
        <div className="max-w-md mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!keyData) {
    return (
      <div className="min-h-screen pb-24 pt-24 px-4">
        <Header title={t('permissions')} showBackButton />
        <div className="max-w-md mx-auto">
          <div className="glass-card p-8 text-center">
            <p>{t('keyNotFound')}</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              {t('backToHome')}
            </Button>
          </div>
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
    >
      <Header title={t('permissions')} showBackButton />
      
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <h2 className="text-2xl font-medium dark:text-white">{t('keyPermissions')}</h2>
          <p className="text-axiv-gray dark:text-gray-400 mb-4">
            {keyData.name} - {permissions.length} {t('people')}
          </p>
          
          <Button 
            onClick={() => setIsInviteModalOpen(true)} 
            className="bg-axiv-blue hover:bg-axiv-blue/90 text-white transition-colors mb-6"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {t('invite')}
          </Button>
        </div>
        
        {permissions.length === 0 ? (
          <div className="glass-card p-8 text-center dark:bg-gray-800 dark:border-gray-700">
            <p className="text-axiv-gray dark:text-gray-400">{t('noUsersHaveAccess')}</p>
          </div>
        ) : (
          <div className="glass-card mb-4 p-0 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
            {permissions.map((permission) => (
              <div 
                key={permission.id} 
                className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium dark:text-white">{permission.user_name}</h3>
                    <p className="text-sm text-axiv-gray dark:text-gray-400">{permission.user_email}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemovePermission(permission.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 h-8 w-8"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm dark:text-gray-300">{t('canUnlock')}</p>
                    <Switch 
                      checked={permission.can_unlock}
                      onCheckedChange={(checked) => handleUpdatePermission(permission, 'can_unlock', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm dark:text-gray-300">{t('canLock')}</p>
                    <Switch 
                      checked={permission.can_lock}
                      onCheckedChange={(checked) => handleUpdatePermission(permission, 'can_lock', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm dark:text-gray-300">{t('canViewHistory')}</p>
                    <Switch 
                      checked={permission.can_view_history}
                      onCheckedChange={(checked) => handleUpdatePermission(permission, 'can_view_history', checked)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="glass-card mb-4 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-4 dark:text-white">{t('invitationSettings')}</h3>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <Label className="text-sm font-medium">{t('allowNewInvitations')}</Label>
              <Switch 
                checked={allowInvitations}
                onCheckedChange={setAllowInvitations}
              />
            </div>
            <p className="text-xs text-axiv-gray dark:text-gray-400">{t('enableDisableInvitations')}</p>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-sm font-medium">{t('requireApproval')}</Label>
              <Switch 
                checked={requireApproval}
                onCheckedChange={setRequireApproval}
              />
            </div>
            <p className="text-xs text-axiv-gray dark:text-gray-400">{t('approvePeopleBeforeAccess')}</p>
          </div>
        </div>
      </div>
      
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-axiv-blue" />
              {t('invitePeople')}
            </DialogTitle>
            <DialogDescription>
              {t('invitePeopleDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm">
                Email
                <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center border rounded-md">
                <div className="pl-3">
                  <Mail className="h-4 w-4 text-axiv-gray" />
                </div>
                <Input
                  id="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="border-0 focus-visible:ring-0"
                  type="email"
                  required
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-sm flex items-center">
                {t('friendOrFamilyName')}
                <span className="text-xs ml-1 text-axiv-gray">{t('optional')}</span>
              </Label>
              <Input
                id="name"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            
            <div className="space-y-3 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="can-unlock" checked={canUnlock} onCheckedChange={(checked) => setCanUnlock(checked === true)} />
                <Label htmlFor="can-unlock" className="text-sm">{t('canUnlock')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="can-lock" checked={canLock} onCheckedChange={(checked) => setCanLock(checked === true)} />
                <Label htmlFor="can-lock" className="text-sm">{t('canLock')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="can-view-history" checked={canViewHistory} onCheckedChange={(checked) => setCanViewHistory(checked === true)} />
                <Label htmlFor="can-view-history" className="text-sm">{t('canViewHistory')}</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button 
              disabled={!inviteEmail || isSending} 
              onClick={handleInviteUser} 
              className="bg-axiv-blue hover:bg-axiv-blue/90 text-white"
            >
              {isSending ? t('sending') : t('sendInvite')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default KeyPermissions;
