
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import PermissionItem from '@/components/PermissionItem';
import InviteUserDialog from '@/components/InviteUserDialog';
import { KeyPermission, fetchKeyPermissions } from '@/utils/permissionUtils';

const KeyPermissions = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [keyData, setKeyData] = useState<any>(null);
  const [permissions, setPermissions] = useState<KeyPermission[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
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
        
        // Fetch permissions from database using our utility function
        try {
          const permissionsData = await fetchKeyPermissions(id);
          setPermissions(permissionsData);
        } catch (error) {
          console.error('Error fetching permissions:', error);
          toast({
            title: t('error'),
            description: t('failedToLoadPermissions'),
            variant: "destructive",
          });
          setPermissions([]);
        }
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
  
  const handlePermissionUpdate = (updatedPermission: KeyPermission) => {
    setPermissions(prev => 
      prev.map(p => p.id === updatedPermission.id ? updatedPermission : p)
    );
  };
  
  const handlePermissionRemove = (permissionId: string) => {
    setPermissions(prev => prev.filter(p => p.id !== permissionId));
  };
  
  const handleInviteSuccess = (newPermission: KeyPermission) => {
    setPermissions(prev => [...prev, newPermission]);
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 pt-24">
        <Header title={t('permissions')} showBackButton />
        <div className="container max-w-md mx-auto px-4">
          <div className="glass-card animate-pulse space-y-4">
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
      <div className="min-h-screen pb-24 pt-24">
        <Header title={t('permissions')} showBackButton />
        <div className="container max-w-md mx-auto px-4">
          <div className="glass-card p-6 text-center">
            <p className="text-axiv-gray dark:text-gray-400">{t('keyNotFound')}</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              {t('backToHome')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen pb-24 pt-24">
      <Header title={t('permissions')} showBackButton />
      
      <div className="container max-w-md mx-auto px-4 space-y-4">
        <div className="glass-card p-6">
          <div className="flex flex-col space-y-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-medium dark:text-white">{t('keyPermissions')}</h2>
              <p className="text-axiv-gray dark:text-gray-400">
                {keyData.name} - {permissions.length} {t('people')}
              </p>
            </div>
            
            <Button 
              onClick={() => setIsInviteModalOpen(true)} 
              className="bg-axiv-blue hover:bg-axiv-blue/90 text-white transition-colors w-full sm:w-auto"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {t('invite')}
            </Button>
          </div>
        </div>
        
        {permissions.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-axiv-gray dark:text-gray-400">{t('noUsersHaveAccess')}</p>
          </div>
        ) : (
          <div className="glass-card p-0 overflow-hidden">
            {permissions.map((permission) => (
              <PermissionItem 
                key={permission.id}
                permission={permission}
                onUpdate={handlePermissionUpdate}
                onRemove={handlePermissionRemove}
              />
            ))}
          </div>
        )}
        
        <div className="glass-card p-6 space-y-6">
          <h3 className="text-lg font-medium dark:text-white">{t('invitationSettings')}</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{t('allowNewInvitations')}</Label>
                <Switch 
                  checked={allowInvitations}
                  onCheckedChange={setAllowInvitations}
                />
              </div>
              <p className="text-xs text-axiv-gray dark:text-gray-400">{t('enableDisableInvitations')}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
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
      </div>
      
      {keyData && id && (
        <InviteUserDialog 
          keyId={id}
          isOpen={isInviteModalOpen}
          onOpenChange={setIsInviteModalOpen}
          onInviteSuccess={handleInviteSuccess}
        />
      )}
    </div>
  );
};

export default KeyPermissions;
