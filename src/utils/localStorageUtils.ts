export interface KeySecuritySettings {
  key_id: string;
  user_id: string;
  two_factor_enabled: boolean;
  lock_history_retention: number;
  notify_on_unlock: boolean;
  vibration_detection: boolean;
}

export type KeyNotificationSettings = {
  all_activity: boolean;
  unlock_events: boolean;
  lock_events: boolean;
  permission_changes: boolean;
  low_battery: boolean;
  attempts_to_unlock: boolean;
  security_alerts: boolean;
  access_requests: boolean;
  userId: string;
  keyId: string;
};

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
