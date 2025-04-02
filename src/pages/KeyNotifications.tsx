
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { KeyNotificationSettings, getNotificationSettings, saveNotificationSettings } from '@/utils/localStorageUtils';

const KeyNotifications = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [keyData, setKeyData] = useState<any>(null);
  const [notificationSettings, setNotificationSettings] = useState<KeyNotificationSettings | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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
        
        // Get notification settings from local storage
        const settings = getNotificationSettings(id, userId);
        setNotificationSettings(settings);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: t('error'),
          description: t('failedToLoadNotificationSettings'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchKeyData();
  }, [id, userId, t]);
  
  const handleSaveSettings = async () => {
    if (!notificationSettings) return;
    
    setSaving(true);
    
    try {
      // Save to localStorage
      saveNotificationSettings(notificationSettings);
      
      toast({
        title: t('settingsSaved'),
        description: t('notificationSettingsUpdated'),
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: t('error'),
        description: t('failedToSaveNotificationSettings'),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleToggleChange = (field: keyof KeyNotificationSettings, checked: boolean) => {
    if (!notificationSettings) return;
    
    setNotificationSettings({
      ...notificationSettings,
      [field]: checked
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 pt-24 px-4">
        <Header title={t('notifications')} showBackButton />
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
        <Header title={t('notifications')} showBackButton />
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
      <Header title={t('notifications')} showBackButton />
      
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <h2 className="text-2xl font-medium dark:text-white">{t('key')}: {keyData.name}</h2>
          <p className="text-axiv-gray dark:text-gray-400 mb-4">{t('notificationSettings')}</p>
        </div>
        
        <div className="glass-card mb-4 p-0 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium dark:text-white">{t('allActivity')}</h3>
                <p className="text-sm text-axiv-gray dark:text-gray-400 mt-1">
                  {t('allActivityDescription')}
                </p>
              </div>
              <Switch 
                checked={notificationSettings?.all_activity || false}
                onCheckedChange={(checked) => handleToggleChange('all_activity', checked)}
              />
            </div>
          </div>
          
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium dark:text-white">{t('unlockEvents')}</h3>
                <p className="text-sm text-axiv-gray dark:text-gray-400 mt-1">
                  {t('receiveNotificationWhenKeyIsUnlocked')}
                </p>
              </div>
              <Switch 
                checked={notificationSettings?.unlock_events || false}
                onCheckedChange={(checked) => handleToggleChange('unlock_events', checked)}
              />
            </div>
          </div>
          
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium dark:text-white">{t('lockEvents')}</h3>
                <p className="text-sm text-axiv-gray dark:text-gray-400 mt-1">
                  {t('receiveNotificationWhenKeyIsLocked')}
                </p>
              </div>
              <Switch 
                checked={notificationSettings?.lock_events || false}
                onCheckedChange={(checked) => handleToggleChange('lock_events', checked)}
              />
            </div>
          </div>
          
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium dark:text-white">{t('permissionChanges')}</h3>
                <p className="text-sm text-axiv-gray dark:text-gray-400 mt-1">
                  {t('notifyWhenPermissionChanges')}
                </p>
              </div>
              <Switch 
                checked={notificationSettings?.permission_changes || false}
                onCheckedChange={(checked) => handleToggleChange('permission_changes', checked)}
              />
            </div>
          </div>
          
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium dark:text-white">{t('lowBattery')}</h3>
                <p className="text-sm text-axiv-gray dark:text-gray-400 mt-1">
                  {t('notifyWhenBatteryIsLow')}
                </p>
              </div>
              <Switch 
                checked={notificationSettings?.low_battery || false}
                onCheckedChange={(checked) => handleToggleChange('low_battery', checked)}
              />
            </div>
          </div>
          
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium dark:text-white">{t('attemptsToUnlock')}</h3>
                <p className="text-sm text-axiv-gray dark:text-gray-400 mt-1">
                  {t('notifyOnFailedUnlockAttempts')}
                </p>
              </div>
              <Switch 
                checked={notificationSettings?.attempts_to_unlock || false}
                onCheckedChange={(checked) => handleToggleChange('attempts_to_unlock', checked)}
              />
            </div>
          </div>
          
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium dark:text-white">{t('securityAlerts')}</h3>
                <p className="text-sm text-axiv-gray dark:text-gray-400 mt-1">
                  {t('receiveImportantSecurityAlerts')}
                </p>
              </div>
              <Switch 
                checked={notificationSettings?.security_alerts || false}
                onCheckedChange={(checked) => handleToggleChange('security_alerts', checked)}
              />
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium dark:text-white">{t('accessRequests')}</h3>
                <p className="text-sm text-axiv-gray dark:text-gray-400 mt-1">
                  {t('notifyWhenSomeoneRequestsAccess')}
                </p>
              </div>
              <Switch 
                checked={notificationSettings?.access_requests || false}
                onCheckedChange={(checked) => handleToggleChange('access_requests', checked)}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveSettings} 
            className="bg-axiv-blue hover:bg-axiv-blue/90 text-white transition-colors"
            disabled={saving}
          >
            {saving ? t('saving') : t('saveSettings')}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default KeyNotifications;
