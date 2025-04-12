
import { useState, useEffect } from 'react';
import { supabase, ReadNotification } from '@/integrations/supabase/client';
import { NotificationData } from '@/components/ActivityItem';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { 
  getReadNotifications, 
  saveReadNotification, 
  saveAllReadNotifications 
} from '@/utils/localStorageUtils';

export const useNotifications = (userId: string | null) => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);

  // Fetch read notifications from database and merge with local storage
  const fetchReadNotifications = async (uid: string) => {
    try {
      // Fetch read notifications from the database using a raw query
      const { data, error } = await supabase
        .from('read_notifications')
        .select('*')
        .eq('user_id', uid);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Cast the data to our helper type
        const readNotifs = data as unknown as ReadNotification[];
        const dbReadIds = readNotifs.map(item => item.notification_id);
        
        // Merge with local storage IDs without duplicates
        const localReadIds = getReadNotifications(uid);
        const mergedIds = [...new Set([...localReadIds, ...dbReadIds])];
        
        setReadNotificationIds(mergedIds);
        
        // Update local storage with merged IDs
        saveAllReadNotifications(uid, mergedIds);
      }
    } catch (error) {
      console.error('Error fetching read notifications:', error);
    }
  };
  
  // Fetch notifications from database or generate demo data
  const fetchNotifications = async (uid: string) => {
    try {
      setLoading(true);
      
      // In a real implementation, you would fetch notifications from a table
      // We'll simulate it with key activities for demonstration
      const { data: keyActivities, error: activityError } = await supabase
        .from('key_activity')
        .select(`
          id,
          action,
          performed_at,
          key_id,
          keys (
            id,
            name,
            battery_level
          )
        `)
        .eq('user_id', uid)
        .order('performed_at', { ascending: false })
        .limit(10);
        
      if (activityError) throw activityError;
      
      // Transform activities into notifications
      const notificationsData: NotificationData[] = keyActivities.map((activity, index) => {
        let type: 'system' | 'key' | 'battery' | 'security' | 'update' = 'key';
        let title = '';
        let message = '';
        
        if (activity.action === 'unlock' || activity.action === 'lock') {
          type = 'key';
          title = activity.action === 'unlock' 
            ? t('keyUnlocked').replace('{keyName}', activity.keys?.name || '') 
            : t('keyLocked').replace('{keyName}', activity.keys?.name || '');
          message = activity.action === 'unlock' 
            ? t('successfullyUnlocked') 
            : t('successfullyLocked');
        } else if (activity.action === 'pair') {
          type = 'security';
          title = t('keyPaired').replace('{keyName}', activity.keys?.name || '');
          message = t('keyPairedSuccessfully');
        } else {
          type = 'system';
          title = t('keyEdited').replace('{keyName}', activity.keys?.name || '');
          message = t('keySettingsChanged');
        }
        
        // Add some random battery notifications
        if (index === 2 && activity.keys?.battery_level && activity.keys.battery_level < 30) {
          type = 'battery';
          title = t('batteryLow');
          message = t('keyBatteryLow').replace('{keyName}', activity.keys.name || '').replace('{level}', String(activity.keys.battery_level));
        }
        
        const isRead = readNotificationIds.includes(activity.id);
        
        return {
          id: activity.id,
          title,
          message,
          timestamp: new Date(activity.performed_at),
          type,
          read: isRead,
          keyId: activity.key_id,
          keyName: activity.keys?.name
        };
      });
      
      // Add a system notification
      const systemNotiId = 'system-1';
      const isSystemNotiRead = readNotificationIds.includes(systemNotiId);
      
      notificationsData.push({
        id: systemNotiId,
        title: t('newFeatureAvailable'),
        message: t('checkOutKeySharing'),
        timestamp: new Date(Date.now() - 172800000), // 2 days ago
        type: 'update',
        read: isSystemNotiRead
      });
      
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: t('error'),
        description: t('failedToLoadNotifications'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save read status to local storage and database
  const saveReadStatus = async (notificationId: string) => {
    if (!userId) return;
    
    try {
      // First update local storage
      saveReadNotification(userId, notificationId);
      
      // Update state
      setReadNotificationIds(prev => {
        if (!prev.includes(notificationId)) {
          return [...prev, notificationId];
        }
        return prev;
      });
      
      // Then save to database
      const { error } = await supabase
        .from('read_notifications')
        .upsert(
          { notification_id: notificationId, user_id: userId }
        );
        
      if (error) {
        // If database error, we still have the local storage update
        console.error('Error saving to database, but local storage updated:', error);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Handle the refresh action
  const handleRefresh = async () => {
    if (!userId) return;
    
    setRefreshing(true);
    await fetchReadNotifications(userId);
    await fetchNotifications(userId);
    setRefreshing(false);
    
    toast({
      title: t('notifications'),
      description: t('notificationsRefreshed'),
    });
  };

  // Mark a single notification as read
  const handleMarkAsRead = async (id: string) => {
    // Save read status to database and local storage
    await saveReadStatus(id);
    
    // Update UI immediately
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    
    try {
      // Get all unread notification IDs
      const unreadIds = notifications
        .filter(n => !n.read)
        .map(n => n.id);
        
      if (unreadIds.length === 0) return;
      
      // First update local storage
      saveAllReadNotifications(userId, unreadIds);
      
      // Update state immediately
      setReadNotificationIds(prev => [...new Set([...prev, ...unreadIds])]);
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      // Create batch of upsert objects for database
      const upsertData = unreadIds.map(id => ({
        notification_id: id,
        user_id: userId
      }));
      
      // Upsert all read statuses to the read_notifications table
      const { error } = await supabase
        .from('read_notifications')
        .upsert(upsertData);
        
      if (error) {
        console.error('Database error when marking all as read:', error);
        // We already updated UI and local storage, so user still sees them as read
      }
      
      toast({
        title: t('notifications'),
        description: t('allNotificationsMarkedAsRead'),
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: t('error'),
        description: t('failedToMarkAllAsRead'),
        variant: "destructive",
      });
    }
  };

  // Get demo notifications for unauthenticated users
  const getDemoNotifications = (demoUserId: string) => {
    const localReadIds = getReadNotifications(demoUserId);
    
    return [
      {
        id: '1',
        title: t('frontDoorUnlocked'),
        message: t('frontDoorUnlockedRemotely'),
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        type: 'key',
        read: localReadIds.includes('1'),
        keyName: 'Front Door'
      },
      {
        id: '2',
        title: t('batteryLow'),
        message: t('officeBatteryLow'),
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        type: 'battery',
        read: localReadIds.includes('2'),
        keyName: 'Office'
      },
      {
        id: '3',
        title: t('newFeatureAvailable'),
        message: t('checkOutKeySharing'),
        timestamp: new Date(Date.now() - 172800000), // 2 days ago
        type: 'update',
        read: localReadIds.includes('3')
      }
    ];
  };

  // Calculate unread count based on the current state
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    loading,
    refreshing,
    unreadCount,
    handleRefresh,
    handleMarkAsRead,
    handleMarkAllAsRead,
    fetchReadNotifications,
    fetchNotifications,
    getDemoNotifications,
  };
};
