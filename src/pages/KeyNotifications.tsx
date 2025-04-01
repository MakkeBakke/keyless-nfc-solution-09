import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BellRing, Bell, Users, Lock, Unlock, Settings, Shield, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

// Define types for notification settings
interface NotificationSettings {
  all_activity: boolean;
  unlock_events: boolean;
  lock_events: boolean;
  permission_changes: boolean;
  low_battery: boolean;
  attempts_to_unlock: boolean;
  security_alerts: boolean;
  access_requests: boolean;
}

const KeyNotifications = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [keyData, setKeyData] = useState<any>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    all_activity: false,
    unlock_events: true,
    lock_events: false,
    permission_changes: true,
    low_battery: true,
    attempts_to_unlock: true,
    security_alerts: true,
    access_requests: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    fetchKeyData();
    fetchNotificationSettings();
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
  
  const fetchNotificationSettings = async () => {
    try {
      setLoading(true);
      
      if (!id) return;
      
      // Get the current user's session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Demo data for unauthenticated users
        setNotificationSettings({
          all_activity: false,
          unlock_events: true,
          lock_events: false,
          permission_changes: true,
          low_battery: true,
          attempts_to_unlock: true,
          security_alerts: true,
          access_requests: true
        });
        setLoading(false);
        return;
      }
      
      // Fetch notification settings for this key
      const { data, error } = await supabase
        .from('key_notification_settings')
        .select('*')
        .eq('key_id', id)
        .eq('user_id', session.user.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, use defaults
          setNotificationSettings({
            all_activity: false,
            unlock_events: true,
            lock_events: false,
            permission_changes: true,
            low_battery: true,
            attempts_to_unlock: true,
            security_alerts: true,
            access_requests: true
          });
        } else {
          throw error;
        }
      } else {
        setNotificationSettings({
          all_activity: data.all_activity,
          unlock_events: data.unlock_events,
          lock_events: data.lock_events,
          permission_changes: data.permission_changes,
          low_battery: data.low_battery,
          attempts_to_unlock: data.attempts_to_unlock,
          security_alerts: data.security_alerts,
          access_requests: data.access_requests
        });
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      toast({
        title: t('error'),
        description: t('failedToLoadNotificationSettings'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const saveNotificationSettings = async () => {
    try {
      if (!id) return;
      
      setSaving(true);
      
      // Get the current user's session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Demo mode - just simulate success
        setTimeout(() => {
          toast({
            title: t('settingsSaved'),
            description: t('notificationSettingsUpdated'),
          });
          setSaving(false);
        }, 1000);
        return;
      }
      
      // Check if settings already exist
      const { data: existingSettings, error: checkError } = await supabase
        .from('key_notification_settings')
        .select('id')
        .eq('key_id', id)
        .eq('user_id', session.user.id);
      
      if (checkError) throw checkError;
      
      if (existingSettings && existingSettings.length > 0) {
        // Update existing settings
        const { error: updateError } = await supabase
          .from('key_notification_settings')
          .update({
            all_activity: notificationSettings.all_activity,
            unlock_events: notificationSettings.unlock_events,
            lock_events: notificationSettings.lock_events,
            permission_changes: notificationSettings.permission_changes,
            low_battery: notificationSettings.low_battery,
            attempts_to_unlock: notificationSettings.attempts_to_unlock,
            security_alerts: notificationSettings.security_alerts,
            access_requests: notificationSettings.access_requests
          })
          .eq('key_id', id)
          .eq('user_id', session.user.id);
        
        if (updateError) throw updateError;
      } else {
        // Insert new settings
        const { error: insertError } = await supabase
          .from('key_notification_settings')
          .insert({
            key_id: id,
            user_id: session.user.id,
            all_activity: notificationSettings.all_activity,
            unlock_events: notificationSettings.unlock_events,
            lock_events: notificationSettings.lock_events,
            permission_changes: notificationSettings.permission_changes,
            low_battery: notificationSettings.low_battery,
            attempts_to_unlock: notificationSettings.attempts_to_unlock,
            security_alerts: notificationSettings.security_alerts,
            access_requests: notificationSettings.access_requests
          });
        
        if (insertError) throw insertError;
      }
      
      toast({
        title: t('settingsSaved'),
        description: t('notificationSettingsUpdated'),
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: t('error'),
        description: t('failedToSaveNotificationSettings'),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleSettingChange = (setting: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    
    // When "all_activity" is toggled on, enable all other settings
    if (setting === 'all_activity' && value === true) {
      setNotificationSettings(prev => ({
        ...prev,
        all_activity: true,
        unlock_events: true,
        lock_events: true,
        permission_changes: true,
        low_battery: true,
        attempts_to_unlock: true,
        security_alerts: true,
        access_requests: true
      }));
    }
    
    // When "all_activity" is toggled off, keep other settings as is
    // When any individual setting is toggled off, ensure "all_activity" is off too
    if (setting !== 'all_activity' && value === false) {
      setNotificationSettings(prev => ({
        ...prev,
        all_activity: false,
      }));
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
      <Header title={t('notifications')} showBackButton />
      
      <div className="max-w-md mx-auto">
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-axiv-blue/10 flex items-center justify-center mr-3">
              <BellRing className="w-6 h-6 text-axiv-blue" />
            </div>
            <div>
              <h2 className="text-xl font-medium">{keyData?.name || t('key')}</h2>
              <p className="text-axiv-gray text-sm">{t('notificationSettings')}</p>
            </div>
          </div>
          
          <div className="space-y-5">
            <div className="border-b border-axiv-light-gray pb-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium">{t('allActivity')}</h3>
                <Switch 
                  checked={notificationSettings.all_activity} 
                  onCheckedChange={(checked) => handleSettingChange('all_activity', checked)}
                />
              </div>
              <p className="text-xs text-axiv-gray">{t('allActivityDescription')}</p>
            </div>
            
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-axiv-blue/10 flex items-center justify-center mr-3">
                    <Unlock className="w-4 h-4 text-axiv-blue" />
                  </div>
                  <span>{t('unlockEvents')}</span>
                </div>
                <Switch 
                  checked={notificationSettings.unlock_events} 
                  onCheckedChange={(checked) => handleSettingChange('unlock_events', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-axiv-blue/10 flex items-center justify-center mr-3">
                    <Lock className="w-4 h-4 text-axiv-blue" />
                  </div>
                  <span>{t('lockEvents')}</span>
                </div>
                <Switch 
                  checked={notificationSettings.lock_events} 
                  onCheckedChange={(checked) => handleSettingChange('lock_events', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-axiv-blue/10 flex items-center justify-center mr-3">
                    <Users className="w-4 h-4 text-axiv-blue" />
                  </div>
                  <span>{t('permissionChanges')}</span>
                </div>
                <Switch 
                  checked={notificationSettings.permission_changes} 
                  onCheckedChange={(checked) => handleSettingChange('permission_changes', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-axiv-blue/10 flex items-center justify-center mr-3">
                    <RefreshCw className="w-4 h-4 text-axiv-blue" />
                  </div>
                  <span>{t('lowBattery')}</span>
                </div>
                <Switch 
                  checked={notificationSettings.low_battery} 
                  onCheckedChange={(checked) => handleSettingChange('low_battery', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-axiv-blue/10 flex items-center justify-center mr-3">
                    <Lock className="w-4 h-4 text-axiv-blue" />
                  </div>
                  <span>{t('attemptsToUnlock')}</span>
                </div>
                <Switch 
                  checked={notificationSettings.attempts_to_unlock} 
                  onCheckedChange={(checked) => handleSettingChange('attempts_to_unlock', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-axiv-blue/10 flex items-center justify-center mr-3">
                    <Shield className="w-4 h-4 text-axiv-blue" />
                  </div>
                  <span>{t('securityAlerts')}</span>
                </div>
                <Switch 
                  checked={notificationSettings.security_alerts} 
                  onCheckedChange={(checked) => handleSettingChange('security_alerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-axiv-blue/10 flex items-center justify-center mr-3">
                    <Bell className="w-4 h-4 text-axiv-blue" />
                  </div>
                  <span>{t('accessRequests')}</span>
                </div>
                <Switch 
                  checked={notificationSettings.access_requests} 
                  onCheckedChange={(checked) => handleSettingChange('access_requests', checked)}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <Button 
              className="w-full" 
              onClick={saveNotificationSettings}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  {t('saving')}
                </>
              ) : (
                t('saveSettings')
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default KeyNotifications;
