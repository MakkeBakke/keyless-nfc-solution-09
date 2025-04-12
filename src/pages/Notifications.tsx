
import React, { useState, useEffect } from 'react';
import { Bell, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase, ReadNotification } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { NotificationItem, NotificationData } from '@/components/ActivityItem';
import { Button } from '@/components/ui/button';
import { getReadNotifications, saveReadNotification, saveAllReadNotifications } from '@/utils/localStorageUtils';

const Notifications = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  
  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserId(session.user.id);
        // Load read notifications from localStorage first
        const localReadIds = getReadNotifications(session.user.id);
        setReadNotificationIds(localReadIds);
        
        // Then fetch from database to merge with local data
        await fetchReadNotifications(session.user.id);
        fetchNotifications(session.user.id);
      } else {
        // For demo, show sample notifications if user is not authenticated
        const demoUserId = 'demo-user-id';
        setUserId(demoUserId);
        
        // Load read notifications for demo user
        const localReadIds = getReadNotifications(demoUserId);
        setReadNotificationIds(localReadIds);
        
        setNotifications([
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
        ]);
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [t]);
  
  const fetchReadNotifications = async (uid: string) => {
    try {
      // Fetch read notifications from the database using a raw query
      // to avoid TypeScript errors with the table not in the generated types
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
    
    // Navigate to key detail if it's a key notification
    const notification = notifications.find(n => n.id === id);
    if (notification?.keyId) {
      navigate(`/key/${notification.keyId}`);
    }
  };
  
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
  
  // Calculate unread count based on the current state
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <motion.div 
      className="min-h-screen pb-24 pt-24 px-4 bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Header title={t('notifications')} showBackButton />
      
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-medium dark:text-white">{t('notifications')}</h2>
            <p className="text-axiv-gray dark:text-gray-400 text-sm">{t('notificationsDesc')}</p>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={handleRefresh}
              className="w-10 h-10 rounded-full bg-axiv-light-gray dark:bg-gray-800 text-axiv-gray dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.97] transition-all"
              disabled={refreshing}
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="glass-card dark:bg-gray-800 dark:border-gray-700 p-8 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-16 h-16 bg-axiv-light-gray dark:bg-gray-700 rounded-full mb-4"></div>
              <div className="h-5 bg-axiv-light-gray dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-axiv-light-gray dark:bg-gray-700 rounded w-1/2 mb-3"></div>
              <div className="h-3 bg-axiv-light-gray dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="glass-card dark:bg-gray-800 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-axiv-blue/10 dark:bg-axiv-blue/20 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-axiv-blue" />
            </div>
            <h3 className="text-lg font-medium mb-2 dark:text-white">{t('noNotifications')}</h3>
            <p className="text-axiv-gray dark:text-gray-400 mb-4">{t('noNotificationsDescription')}</p>
          </div>
        ) : (
          <>
            {unreadCount > 0 && (
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-axiv-gray dark:text-gray-400">
                  {unreadCount} {unreadCount === 1 ? t('unreadNotification') : t('unreadNotifications')}
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleMarkAllAsRead}
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
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Notifications;
