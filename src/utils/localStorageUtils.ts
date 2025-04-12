
// Define interfaces and types
export interface KeySecuritySettings {
  key_id: string;
  user_id: string;
  two_factor_enabled: boolean;
  lock_history_retention: number;
  notify_on_unlock: boolean;
  vibration_detection: boolean;
}

export type KeyNotificationSettings = {
  keyId: string;
  userId: string;
  all_activity: boolean;
  unlock_events: boolean;
  lock_events: boolean;
  permission_changes: boolean;
  low_battery: boolean;
  attempts_to_unlock: boolean;
  security_alerts: boolean;
  access_requests: boolean;
};

export interface ReadNotificationsStore {
  userId: string;
  readIds: string[];
}

// Security settings utils
export const getSecuritySettings = (keyId: string, userId: string): KeySecuritySettings => {
  try {
    const key = `security_settings_${keyId}_${userId}`;
    const storedSettings = localStorage.getItem(key);
    
    if (storedSettings) {
      return JSON.parse(storedSettings);
    }
    
    // Default settings
    return {
      key_id: keyId,
      user_id: userId,
      two_factor_enabled: false,
      lock_history_retention: 30,
      notify_on_unlock: true,
      vibration_detection: false,
    };
  } catch (error) {
    console.error('Error getting security settings:', error);
    
    // Fallback default settings
    return {
      key_id: keyId,
      user_id: userId,
      two_factor_enabled: false,
      lock_history_retention: 30,
      notify_on_unlock: true,
      vibration_detection: false,
    };
  }
};

export const saveSecuritySettings = (settings: KeySecuritySettings): void => {
  try {
    const key = `security_settings_${settings.key_id}_${settings.user_id}`;
    localStorage.setItem(key, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving security settings:', error);
    throw error;
  }
};

// Read notifications utils
export const getReadNotifications = (userId: string): string[] => {
  try {
    const key = `read_notifications_${userId}`;
    const storedReadNotifications = localStorage.getItem(key);
    
    if (storedReadNotifications) {
      const data: ReadNotificationsStore = JSON.parse(storedReadNotifications);
      return data.readIds;
    }
    
    return [];
  } catch (error) {
    console.error('Error getting read notifications:', error);
    return [];
  }
};

export const saveReadNotification = (userId: string, notificationId: string): void => {
  try {
    const key = `read_notifications_${userId}`;
    const readIds = getReadNotifications(userId);
    
    // Only add if not already in the array
    if (!readIds.includes(notificationId)) {
      readIds.push(notificationId);
    }
    
    const data: ReadNotificationsStore = {
      userId,
      readIds
    };
    
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving read notification:', error);
  }
};

export const saveAllReadNotifications = (userId: string, notificationIds: string[]): void => {
  try {
    const key = `read_notifications_${userId}`;
    const readIds = getReadNotifications(userId);
    
    // Merge existing and new read IDs without duplicates
    const updatedReadIds = [...new Set([...readIds, ...notificationIds])];
    
    const data: ReadNotificationsStore = {
      userId,
      readIds: updatedReadIds
    };
    
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving all read notifications:', error);
  }
};
