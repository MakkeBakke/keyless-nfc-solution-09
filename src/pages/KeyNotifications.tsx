
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import KeyNotificationSettingsPanel from '@/components/notifications/KeyNotificationSettings';
import { useKeyNotifications } from '@/hooks/useKeyNotifications';

const KeyNotifications = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [userId, setUserId] = useState<string | null>(null);

  // Using our custom hook for key notification settings
  const {
    keyData,
    loading,
    saving,
    notificationSettings,
    handleSaveSettings,
    handleToggleChange
  } = useKeyNotifications(id, userId);

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
        
        {notificationSettings && (
          <KeyNotificationSettingsPanel 
            settings={notificationSettings}
            onToggleChange={handleToggleChange}
          />
        )}
        
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
