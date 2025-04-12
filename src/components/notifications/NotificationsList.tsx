
import React from 'react';
import { Button } from '@/components/ui/button';
import { NotificationItem, NotificationData } from '@/components/ActivityItem';
import { useLanguage } from '@/contexts/LanguageContext';

interface NotificationsListProps {
  notifications: NotificationData[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificationsList = ({ 
  notifications, 
  unreadCount, 
  onMarkAsRead, 
  onMarkAllAsRead 
}: NotificationsListProps) => {
  const { t } = useLanguage();

  return (
    <>
      {unreadCount > 0 && (
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm text-axiv-gray dark:text-gray-400">
            {unreadCount} {unreadCount === 1 ? t('unreadNotification') : t('unreadNotifications')}
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onMarkAllAsRead}
            className="text-axiv-blue hover:text-axiv-blue/80 dark:text-axiv-blue dark:hover:text-axiv-blue/80"
          >
            {t('markAllAsRead')}
          </Button>
        </div>
      )}
      
      <div className="glass-card dark:bg-gray-800 dark:border-gray-700 p-2 space-y-0 divide-y divide-gray-100 dark:divide-gray-700">
        {notifications.map((notification) => (
          <NotificationItem 
            key={notification.id} 
            notification={notification} 
            onMarkAsRead={onMarkAsRead}
          />
        ))}
      </div>
    </>
  );
};

export default NotificationsList;
