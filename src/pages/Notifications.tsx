
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import NotificationsHeader from '@/components/notifications/NotificationsHeader';
import NotificationsList from '@/components/notifications/NotificationsList';
import LoadingState from '@/components/notifications/LoadingState';
import EmptyState from '@/components/notifications/EmptyState';
import { useNotifications } from '@/hooks/useNotifications';

const Notifications = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  
  // Using our custom hook for notifications logic
  const {
    notifications,
    loading,
    refreshing,
    unreadCount,
    handleRefresh,
    handleMarkAsRead,
    handleMarkAllAsRead,
    fetchReadNotifications,
    fetchNotifications,
    getDemoNotifications
  } = useNotifications(userId);
  
  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserId(session.user.id);
        // Load read notifications from localStorage first
        await fetchReadNotifications(session.user.id);
        await fetchNotifications(session.user.id);
      } else {
        // For demo, show sample notifications if user is not authenticated
        const demoUserId = 'demo-user-id';
        setUserId(demoUserId);
      }
    };
    
    checkAuth();
  }, []);
  
  // Handle navigation when a notification is clicked
  const handleNotificationClick = async (id: string) => {
    await handleMarkAsRead(id);
    
    const notification = notifications.find(n => n.id === id);
    if (notification?.keyId) {
      navigate(`/key/${notification.keyId}`);
    }
  };
  
  return (
    <motion.div 
      className="min-h-screen pb-24 pt-24 px-4 bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Header title="notifications" showBackButton />
      
      <div className="max-w-md mx-auto">
        <NotificationsHeader 
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
        
        {loading ? (
          <LoadingState />
        ) : notifications.length === 0 ? (
          <EmptyState />
        ) : (
          <NotificationsList 
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={handleNotificationClick}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        )}
      </div>
    </motion.div>
  );
};

export default Notifications;
