
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { KeyNotificationSettings } from '@/utils/localStorageUtils';

export const useKeyNotifications = (keyId: string | undefined, userId: string | null) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [keyData, setKeyData] = useState<any>(null);
  const [notificationSettings, setNotificationSettings] = useState<KeyNotificationSettings | null>(null);

  // Get notification settings from local storage
  const getNotificationSettings = (keyId: string, userId: string): KeyNotificationSettings => {
    try {
      const key = `notification_settings_${keyId}_${userId}`;
      const storedSettings = localStorage.getItem(key);
      
      if (storedSettings) {
        return JSON.parse(storedSettings);
      }
      
      // Default settings
      return {
        keyId,
        userId,
        all_activity: true,
        unlock_events: true,
        lock_events: true,
        permission_changes: false,
        low_battery: true,
        attempts_to_unlock: true,
        security_alerts: true,
        access_requests: false,
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      
      // Fallback default settings
      return {
        keyId,
        userId,
        all_activity: true,
        unlock_events: true,
        lock_events: true,
        permission_changes: false,
        low_battery: true,
        attempts_to_unlock: true,
        security_alerts: true,
        access_requests: false,
      };
    }
  };

  // Save notification settings to local storage
  const saveNotificationSettings = (settings: KeyNotificationSettings): void => {
    try {
      const key = `notification_settings_${settings.keyId}_${settings.userId}`;
      localStorage.setItem(key, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!keyId || !userId) return;
    
    const fetchKeyData = async () => {
      setLoading(true);
      
      try {
        // Fetch key data from database
        const { data, error } = await supabase
          .from('keys')
          .select('*')
          .eq('id', keyId)
          .single();
        
        if (error) {
          // For demo, provide mock data if there's an error
          setKeyData({
            id: keyId,
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
        const settings = getNotificationSettings(keyId, userId);
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
  }, [keyId, userId, t]);
  
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

  return {
    keyData,
    loading,
    saving,
    notificationSettings,
    handleSaveSettings,
    handleToggleChange
  };
};
