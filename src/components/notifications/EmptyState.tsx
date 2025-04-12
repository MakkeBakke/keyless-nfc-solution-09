
import React from 'react';
import { Bell } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const EmptyState = () => {
  const { t } = useLanguage();

  return (
    <div className="glass-card dark:bg-gray-800 dark:border-gray-700 p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-axiv-blue/10 dark:bg-axiv-blue/20 flex items-center justify-center mx-auto mb-4">
        <Bell className="w-8 h-8 text-axiv-blue" />
      </div>
      <h3 className="text-lg font-medium mb-2 dark:text-white">{t('noNotifications')}</h3>
      <p className="text-axiv-gray dark:text-gray-400 mb-4">{t('noNotificationsDescription')}</p>
    </div>
  );
};

export default EmptyState;
