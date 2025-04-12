
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NotificationsHeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
}

const NotificationsHeader = ({ onRefresh, refreshing }: NotificationsHeaderProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-2xl font-medium dark:text-white">{t('notifications')}</h2>
        <p className="text-axiv-gray dark:text-gray-400 text-sm">{t('notificationsDesc')}</p>
      </div>
      
      <div className="flex space-x-2">
        <button 
          onClick={onRefresh}
          className="w-10 h-10 rounded-full bg-axiv-light-gray dark:bg-gray-800 text-axiv-gray dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.97] transition-all"
          disabled={refreshing}
        >
          <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );
};

export default NotificationsHeader;
