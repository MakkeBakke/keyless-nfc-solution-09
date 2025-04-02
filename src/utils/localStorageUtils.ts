
// Utility functions for working with mock data in localStorage

// Mock notification settings type
export interface KeyNotificationSettings {
  id: string;
  key_id: string;
  user_id: string;
  all_activity: boolean;
  unlock_events: boolean;
  lock_events: boolean;
  permission_changes: boolean;
  low_battery: boolean;
  attempts_to_unlock: boolean;
  security_alerts: boolean;
  access_requests: boolean;
}

// Mock permission type
export interface KeyPermission {
  id: string;
  key_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  can_unlock: boolean;
  can_lock: boolean;
  can_view_history: boolean;
}

// Mock security settings type
export interface KeySecuritySettings {
  id: string;
  key_id: string;
  user_id: string;
  auto_lock_enabled: boolean;
  auto_lock_delay: number;
  geofencing_enabled: boolean;
  two_factor_enabled: boolean;
  lock_history_retention: number;
  notify_on_unlock: boolean;
  vibration_detection: boolean;
}

// Get notification settings from localStorage
export const getNotificationSettings = (keyId: string, userId: string): KeyNotificationSettings => {
  const storageKey = `key_notification_settings_${keyId}`;
  const storedSettings = localStorage.getItem(storageKey);
  
  if (storedSettings) {
    return JSON.parse(storedSettings);
  }
  
  // Default settings
  const defaultSettings: KeyNotificationSettings = {
    id: crypto.randomUUID(),
    key_id: keyId,
    user_id: userId,
    all_activity: true,
    unlock_events: true,
    lock_events: true,
    permission_changes: true,
    low_battery: true,
    attempts_to_unlock: true,
    security_alerts: true,
    access_requests: true
  };
  
  localStorage.setItem(storageKey, JSON.stringify(defaultSettings));
  return defaultSettings;
};

// Save notification settings to localStorage
export const saveNotificationSettings = (settings: KeyNotificationSettings): void => {
  const storageKey = `key_notification_settings_${settings.key_id}`;
  localStorage.setItem(storageKey, JSON.stringify(settings));
};

// Get key permissions from localStorage
export const getKeyPermissions = (keyId: string): KeyPermission[] => {
  const storageKey = `key_permissions_${keyId}`;
  const storedPermissions = localStorage.getItem(storageKey);
  
  if (storedPermissions) {
    return JSON.parse(storedPermissions);
  }
  
  // Default empty array
  return [];
};

// Save key permissions to localStorage
export const saveKeyPermissions = (keyId: string, permissions: KeyPermission[]): void => {
  const storageKey = `key_permissions_${keyId}`;
  localStorage.setItem(storageKey, JSON.stringify(permissions));
};

// Add new permission
export const addKeyPermission = (
  keyId: string, 
  userId: string,
  userEmail: string,
  userName: string,
  canUnlock = true,
  canLock = true,
  canViewHistory = false
): KeyPermission => {
  const permissions = getKeyPermissions(keyId);
  
  // Check if user already has permission
  const existingPermission = permissions.find(p => p.user_email === userEmail);
  if (existingPermission) {
    return existingPermission;
  }
  
  // Create new permission
  const newPermission: KeyPermission = {
    id: crypto.randomUUID(),
    key_id: keyId,
    user_id: userId,
    user_email: userEmail,
    user_name: userName,
    can_unlock: canUnlock,
    can_lock: canLock,
    can_view_history: canViewHistory
  };
  
  permissions.push(newPermission);
  saveKeyPermissions(keyId, permissions);
  return newPermission;
};

// Remove permission
export const removeKeyPermission = (keyId: string, permissionId: string): void => {
  const permissions = getKeyPermissions(keyId);
  const updatedPermissions = permissions.filter(p => p.id !== permissionId);
  saveKeyPermissions(keyId, updatedPermissions);
};

// Update permission
export const updateKeyPermission = (keyId: string, updatedPermission: KeyPermission): void => {
  const permissions = getKeyPermissions(keyId);
  const index = permissions.findIndex(p => p.id === updatedPermission.id);
  
  if (index !== -1) {
    permissions[index] = updatedPermission;
    saveKeyPermissions(keyId, permissions);
  }
};

// Get security settings from localStorage
export const getSecuritySettings = (keyId: string, userId: string): KeySecuritySettings => {
  const storageKey = `key_security_settings_${keyId}`;
  const storedSettings = localStorage.getItem(storageKey);
  
  if (storedSettings) {
    return JSON.parse(storedSettings);
  }
  
  // Default settings
  const defaultSettings: KeySecuritySettings = {
    id: crypto.randomUUID(),
    key_id: keyId,
    user_id: userId,
    auto_lock_enabled: true,
    auto_lock_delay: 30,
    geofencing_enabled: false,
    two_factor_enabled: false,
    lock_history_retention: 30,
    notify_on_unlock: true,
    vibration_detection: false
  };
  
  localStorage.setItem(storageKey, JSON.stringify(defaultSettings));
  return defaultSettings;
};

// Save security settings to localStorage
export const saveSecuritySettings = (settings: KeySecuritySettings): void => {
  const storageKey = `key_security_settings_${settings.key_id}`;
  localStorage.setItem(storageKey, JSON.stringify(settings));
};
