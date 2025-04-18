import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { KeySecuritySettings, getSecuritySettings, saveSecuritySettings } from '@/utils/localStorageUtils';
import { usePinSecurity } from '@/contexts/PinSecurityContext';
import PinVerificationDialog from '@/components/PinVerificationDialog';

const KeySecurity = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { requireVerification } = usePinSecurity();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [keyData, setKeyData] = useState<any>(null);
  const [securitySettings, setSecuritySettings] = useState<KeySecuritySettings | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pendingSettings, setPendingSettings] = useState<KeySecuritySettings | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserId(session.user.id);
      } else {
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
        const { data, error } = await supabase
          .from('keys')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
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
        
        const settings = getSecuritySettings(id, userId);
        setSecuritySettings(settings);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: t('error'),
          description: t('failedToLoadSecuritySettings'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchKeyData();
  }, [id, userId, t]);
  
  const handleToggleChange = (field: keyof KeySecuritySettings, checked: boolean) => {
    if (!securitySettings) return;
    
    setSecuritySettings({
      ...securitySettings,
      [field]: checked
    });
  };
  
  const handleSliderChange = (field: keyof KeySecuritySettings, value: number[]) => {
    if (!securitySettings) return;
    
    setSecuritySettings({
      ...securitySettings,
      [field]: value[0]
    });
  };
  
  const handleSaveSettings = async () => {
    if (!securitySettings) return;
    
    setPendingSettings(securitySettings);
    requireVerification();
    setShowPinDialog(true);
  };

  const handlePinDialogClose = () => {
    setShowPinDialog(false);
    setPendingSettings(null);
  };

  const handlePinVerificationSuccess = async () => {
    if (!pendingSettings) return;
    
    setSaving(true);
    
    try {
      saveSecuritySettings(pendingSettings);
      
      toast({
        title: t('settingsSaved'),
        description: t('securitySettingsUpdated'),
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: t('error'),
        description: t('failedToSaveSecuritySettings'),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setPendingSettings(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 pt-24 px-4">
        <Header title={t('security')} showBackButton />
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
        <Header title={t('security')} showBackButton />
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
      <Header title={t('security')} showBackButton />
      
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <h2 className="text-2xl font-medium dark:text-white">{t('key')}: {keyData.name}</h2>
        </div>
        
        <div className="glass-card mb-4 p-0 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium dark:text-white">{t('twoFactorAuth')}</h3>
                <p className="text-sm text-axiv-gray dark:text-gray-400 mt-1">
                  {t('twoFactorAuthDescription')}
                </p>
              </div>
              <Switch 
                checked={securitySettings?.two_factor_enabled || false}
                onCheckedChange={(checked) => handleToggleChange('two_factor_enabled', checked)}
              />
            </div>
          </div>
          
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h3 className="font-medium mb-2 dark:text-white">{t('historyRetention')}</h3>
              <p className="text-sm text-axiv-gray dark:text-gray-400 mb-3">
                {t('historyRetentionDescription')}
              </p>
              
              <div className="flex items-center">
                <div className="flex-1 pr-4">
                  <Slider 
                    value={[securitySettings?.lock_history_retention || 30]} 
                    min={7} 
                    max={90} 
                    step={1} 
                    onValueChange={(value) => handleSliderChange('lock_history_retention', value)} 
                  />
                </div>
                <div className="w-16 text-right text-sm dark:text-gray-300">
                  {securitySettings?.lock_history_retention || 30} {t('days')}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium dark:text-white">{t('unlockNotifications')}</h3>
                <p className="text-sm text-axiv-gray dark:text-gray-400 mt-1">
                  {t('unlockNotificationsDescription')}
                </p>
              </div>
              <Switch 
                checked={securitySettings?.notify_on_unlock || false}
                onCheckedChange={(checked) => handleToggleChange('notify_on_unlock', checked)}
              />
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium dark:text-white">{t('vibrationDetection')}</h3>
                <p className="text-sm text-axiv-gray dark:text-gray-400 mt-1">
                  {t('vibrationDetectionDescription')}
                </p>
              </div>
              <Switch 
                checked={securitySettings?.vibration_detection || false}
                onCheckedChange={(checked) => handleToggleChange('vibration_detection', checked)}
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
      
      <PinVerificationDialog 
        isOpen={showPinDialog}
        onClose={handlePinDialogClose}
        onSuccess={handlePinVerificationSuccess}
        title={t('securityVerification')}
        description={t('enterPinToSaveSettings')}
      />
    </motion.div>
  );
};

export default KeySecurity;
