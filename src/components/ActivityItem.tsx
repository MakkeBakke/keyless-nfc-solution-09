
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Lock, Unlock, Key, Bell, BatteryLow, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

// Export the ActivityData interface for use in other components
export interface ActivityData {
  id: string;
  keyName: string;
  action: string;
  timestamp: Date | string;
  success?: boolean;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  timestamp: Date | string;
  type: 'system' | 'key' | 'battery' | 'security' | 'update';
  read: boolean;
  keyId?: string;
  keyName?: string;
}

interface ActivityItemProps {
  activity: {
    id: string;
    keyName: string;
    action: string;
    timestamp: string | Date;
    success?: boolean;
  };
}

interface NotificationItemProps {
  notification: NotificationData;
  onMarkAsRead?: (id: string) => void;
}

export const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  const iconMap: Record<string, React.ReactNode> = {
    system: <Bell size={16} />,
    key: <Key size={16} />,
    battery: <BatteryLow size={16} />,
    security: <Lock size={16} />,
    update: <UserPlus size={16} />
  };
  
  // Ensure timestamp is a Date object
  const timestampDate = notification.timestamp instanceof Date 
    ? notification.timestamp 
    : new Date(notification.timestamp);
  
  const handleMarkAsRead = () => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };
  
  return (
    <div 
      className={cn(
        "flex items-center py-3 border-b border-gray-100 dark:border-gray-700 animate-slide-up cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
        !notification.read && "border-l-4 border-axiv-blue px-3"
      )}
      onClick={handleMarkAsRead}
    >
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center mr-3",
        notification.type === 'battery' 
          ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" 
          : notification.type === 'security' 
            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
            : "bg-axiv-blue/10 text-axiv-blue dark:bg-axiv-blue/20"
      )}>
        {iconMap[notification.type] || <Bell size={16} />}
      </div>
      
      <div className="flex-1">
        <p className={cn(
          "text-sm font-medium dark:text-gray-200",
          !notification.read && "font-bold"
        )}>
          {notification.title}
        </p>
        <p className="text-xs text-axiv-gray dark:text-gray-400">
          {notification.message}
        </p>
        <p className="text-xs text-axiv-gray dark:text-gray-500 mt-1">
          {formatDistanceToNow(timestampDate, { addSuffix: true })}
        </p>
      </div>
      
      {!notification.read && (
        <span className="w-2 h-2 rounded-full bg-axiv-blue mr-2"></span>
      )}
    </div>
  );
};

const ActivityItem = ({ activity }: ActivityItemProps) => {
  const { t } = useLanguage();
  const { theme } = useTheme();

  const iconMap: Record<string, React.ReactNode> = {
    unlock: <Unlock size={16} />,
    lock: <Lock size={16} />,
    pair: <Key size={16} />,
    edit: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 4H4C3.44772 4 3 4.44772 3 5V20C3 20.5523 3.44772 21 4 21H19C19.5523 21 20 20.5523 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.5 2.5C18.7626 2.23735 19.1131 2.07957 19.4999 2.07957C19.8867 2.07957 20.2372 2.23735 20.4999 2.5C20.7625 2.76264 20.9203 3.11317 20.9203 3.5C20.9203 3.88683 20.7625 4.23735 20.4999 4.5L12 13L9 14L10 11L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  };
  
  const getActionText = (action: string) => {
    switch (action) {
      case 'unlock': return t('unlocked');
      case 'lock': return t('locked');
      case 'pair': return t('paired');
      case 'edit': return t('edited');
      default: return t('used');
    }
  };
  
  // Ensure timestamp is a Date object
  const timestampDate = activity.timestamp instanceof Date 
    ? activity.timestamp 
    : new Date(activity.timestamp);
  
  // Default success to true if not provided
  const success = activity.success !== undefined ? activity.success : true;
  
  return (
    <div className="flex items-center py-3 border-b border-gray-100 dark:border-gray-700 animate-slide-up">
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center mr-3",
        success 
          ? activity.action === 'unlock' 
            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
            : "bg-axiv-blue/10 text-axiv-blue dark:bg-axiv-blue/20 dark:text-axiv-blue"
          : "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400"
      )}>
        {iconMap[activity.action] || iconMap.edit}
      </div>
      
      <div className="flex-1">
        <p className="text-sm font-medium dark:text-gray-200">
          {getActionText(activity.action)} <span className="font-bold">{activity.keyName}</span>
        </p>
        <p className="text-xs text-axiv-gray dark:text-gray-400">
          {formatDistanceToNow(timestampDate, { addSuffix: true })}
        </p>
      </div>
      
      {!success && (
        <span className="text-xs text-red-500 px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded-full">
          {t('failed')}
        </span>
      )}
    </div>
  );
};

export default ActivityItem;
