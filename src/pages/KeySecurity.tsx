
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Shield, Lock, Key, Fingerprint, Clock, RefreshCw, AlarmClock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

// Define types for security settings
interface SecuritySettings {
  auto_lock_enabled: boolean;
  auto_lock_delay: number; // in minutes
  geofencing_enabled: boolean;
  two_factor_enabled: boolean;
  lock_history_retention: number; // in days
  notify_on_unlock: boolean;
  vibration_detection: boolean;
}

const KeySecurity = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  const [keyData, setKeyData] = useState<any>(null);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    auto_lock_enabled: true,
    auto_lock_delay: 30,
    geofencing_enabled: false,
    two_factor_enabled: false,
    lock_history_retention: 90,
    notify_on_unlock: true,
    vibration_detection: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    fetchKeyData();
    fetchSecuritySettings();
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
  
  const fetchSecuritySettings = async () => {
    try {
      setLoading(true);
      
      if (!id) return;
      
      // Get the current user's session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Demo data for unauthenticated users
        setSecuritySettings({
          auto_lock_enabled: true,
          auto_lock_delay: 30,
          geofencing_enabled: false,
          two_factor_enabled: false,
          lock_history_retention: 90,
          notify_on_unlock: true,
          vibration_detection: true
        });
        setLoading(false);
        return;
      }
      
      // Fetch security settings for this key
      const { data, error } = await supabase
        .from('key_security_settings')
        .select('*')
        .eq('key_id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, use defaults
          setSecuritySettings({
            auto_lock_enabled: true,
            auto_lock_delay: 30,
            geofencing_enabled: false,
            two_factor_enabled: false,
            lock_history_retention: 90,
            notify_on_unlock: true,
            vibration_detection: true
          });
        } else {
          throw error;
        }
      } else {
        setSecuritySettings({
          auto_lock_enabled: data.auto_lock_enabled,
          auto_lock_delay: data.auto_lock_delay,
          geofencing_enabled: data.geofencing_enabled,
          two_factor_enabled: data.two_factor_enabled,
          lock_history_retention: data.lock_history_retention,
          notify_on_unlock: data.notify_on_unlock,
          vibration_detection: data.vibration_detection
        });
      }
    } catch (error) {
      console.error('Error fetching security settings:', error);
      toast({
        title: t('error'),
        description: t('failedToLoadSecuritySettings'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const saveSecuritySettings = async () => {
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
            description: t('securitySettingsUpdated'),
          });
          setSaving(false);
        }, 1000);
        return;
      }
      
      // Check if settings already exist
      const { data: existingSettings, error: checkError } = await supabase
        .from('key_security_settings')
        .select('id')
        .eq('key_id', id);
      
      if (checkError) throw checkError;
      
      if (existingSettings && existingSettings.length > 0) {
        // Update existing settings
        const { error: updateError } = await supabase
          .from('key_security_settings')
          .update({
            auto_lock_enabled: securitySettings.auto_lock_enabled,
            auto_lock_delay: securitySettings.auto_lock_delay,
            geofencing_enabled: securitySettings.geofencing_enabled,
            two_factor_enabled: securitySettings.two_factor_enabled,
            lock_history_retention: securitySettings.lock_history_retention,
            notify_on_unlock: securitySettings.notify_on_unlock,
            vibration_detection: securitySettings.vibration_detection
          })
          .eq('key_id', id);
        
        if (updateError) throw updateError;
      } else {
        // Insert new settings
        const { error: insertError } = await supabase
          .from('key_security_settings')
          .insert({
            key_id: id,
            auto_lock_enabled: securitySettings.auto_lock_enabled,
            auto_lock_delay: securitySettings.auto_lock_delay,
            geofencing_enabled: securitySettings.geofencing_enabled,
            two_factor_enabled: securitySettings.two_factor_enabled,
            lock_history_retention: securitySettings.lock_history_retention,
            notify_on_unlock: securitySettings.notify_on_unlock,
            vibration_detection: securitySettings.vibration_detection
          });
        
        if (insertError) throw insertError;
      }
      
      toast({
        title: t('settingsSaved'),
        description: t('securitySettingsUpdated'),
      });
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast({
        title: t('error'),
        description: t('failedToSaveSecuritySettings'),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleSettingChange = (setting: keyof SecuritySettings, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value
    }));
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
      <Header title={t('securitySettings')} showBackButton />
      
      <div className="max-w-md mx-auto">
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-axiv-blue/10 flex items-center justify-center mr-3">
              <Shield className="w-6 h-6 text-axiv-blue" />
            </div>
            <div>
              <h2 className="text-xl font-medium">{keyData?.name || t('key')}</h2>
              <p className="text-axiv-gray text-sm">{t('securitySettings')}</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Auto Lock */}
            <div className="border-b border-axiv-light-gray pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-axiv-blue/10 flex items-center justify-center mr-3">
                    <Lock className="w-4 h-4 text-axiv-blue" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t('autoLock')}</h3>
                    <p className="text-xs text-axiv-gray">{t('autoLockDescription')}</p>
                  </div>
                </div>
                <Switch 
                  checked={securitySettings.auto_lock_enabled} 
                  onCheckedChange={(checked) => handleSettingChange('auto_lock_enabled', checked)}
                />
              </div>
              
              {securitySettings.auto_lock_enabled && (
                <div className="ml-11 mt-3">
                  <label className="block text-sm mb-1">{t('autoLockDelay')}</label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="1"
                      max="120"
                      value={securitySettings.auto_lock_delay}
                      onChange={(e) => handleSettingChange('auto_lock_delay', parseInt(e.target.value))}
                      className="w-full mr-3"
                    />
                    <span className="text-sm whitespace-nowrap">
                      {securitySettings.auto_lock_delay} {t('minutes')}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Geofencing */}
            <div className="border-b border-axiv-light-gray pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-axiv-blue/10 flex items-center justify-center mr-3">
                    <Key className="w-4 h-4 text-axiv-blue" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t('geofencing')}</h3>
                    <p className="text-xs text-axiv-gray">{t('geofencingDescription')}</p>
                  </div>
                </div>
                <Switch 
                  checked={securitySettings.geofencing_enabled} 
                  onCheckedChange={(checked) => handleSettingChange('geofencing_enabled', checked)}
                />
              </div>
            </div>
            
            {/* Two-factor authentication */}
            <div className="border-b border-axiv-light-gray pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-axiv-blue/10 flex items-center justify-center mr-3">
                    <Fingerprint className="w-4 h-4 text-axiv-blue" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t('twoFactorAuth')}</h3>
                    <p className="text-xs text-axiv-gray">{t('twoFactorAuthDescription')}</p>
                  </div>
                </div>
                <Switch 
                  checked={securitySettings.two_factor_enabled} 
                  onCheckedChange={(checked) => handleSettingChange('two_factor_enabled', checked)}
                />
              </div>
            </div>
            
            {/* History Retention */}
            <div className="border-b border-axiv-light-gray pb-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-axiv-blue/10 flex items-center justify-center mr-3">
                  <Clock className="w-4 h-4 text-axiv-blue" />
                </div>
                <div>
                  <h3 className="font-medium">{t('historyRetention')}</h3>
                  <p className="text-xs text-axiv-gray">{t('historyRetentionDescription')}</p>
                </div>
              </div>
              
              <div className="ml-11 mt-2">
                <div className="flex items-center">
                  <input
                    type="range"
                    min="7"
                    max="365"
                    step="7"
                    value={securitySettings.lock_history_retention}
                    onChange={(e) => handleSettingChange('lock_history_retention', parseInt(e.target.value))}
                    className="w-full mr-3"
                  />
                  <span className="text-sm whitespace-nowrap">
                    {securitySettings.lock_history_retention} {t('days')}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Unlock Notifications */}
            <div className="border-b border-axiv-light-gray pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-axiv-blue/10 flex items-center justify-center mr-3">
                    <AlarmClock className="w-4 h-4 text-axiv-blue" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t('unlockNotifications')}</h3>
                    <p className="text-xs text-axiv-gray">{t('unlockNotificationsDescription')}</p>
                  </div>
                </div>
                <Switch 
                  checked={securitySettings.notify_on_unlock} 
                  onCheckedChange={(checked) => handleSettingChange('notify_on_unlock', checked)}
                />
              </div>
            </div>
            
            {/* Vibration Detection */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-axiv-blue/10 flex items-center justify-center mr-3">
                    <RefreshCw className="w-4 h-4 text-axiv-blue" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t('vibrationDetection')}</h3>
                    <p className="text-xs text-axiv-gray">{t('vibrationDetectionDescription')}</p>
                  </div>
                </div>
                <Switch 
                  checked={securitySettings.vibration_detection} 
                  onCheckedChange={(checked) => handleSettingChange('vibration_detection', checked)}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <Button 
              className="w-full" 
              onClick={saveSecuritySettings}
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

export default KeySecurity;
