
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import NotificationToggleItem from './NotificationToggleItem';
import { KeyNotificationSettings } from '@/utils/localStorageUtils';

interface KeyNotificationSettingsProps {
  settings: KeyNotificationSettings;
  onToggleChange: (field: keyof KeyNotificationSettings, checked: boolean) => void;
}

const KeyNotificationSettingsPanel = ({ 
  settings, 
  onToggleChange 
}: KeyNotificationSettingsProps) => {
  const { t } = useLanguage();

  const toggleItems = [
    {
      field: 'all_activity' as keyof KeyNotificationSettings,
      title: t('allActivity'),
      description: t('allActivityDescription')
    },
    {
      field: 'unlock_events' as keyof KeyNotificationSettings,
      title: t('unlockEvents'),
      description: t('receiveNotificationWhenKeyIsUnlocked')
    },
    {
      field: 'lock_events' as keyof KeyNotificationSettings,
      title: t('lockEvents'),
      description: t('receiveNotificationWhenKeyIsLocked')
    },
    {
      field: 'permission_changes' as keyof KeyNotificationSettings,
      title: t('permissionChanges'),
      description: t('notifyWhenPermissionChanges')
    },
    {
      field: 'low_battery' as keyof KeyNotificationSettings,
      title: t('lowBattery'),
      description: t('notifyWhenBatteryIsLow')
    },
    {
      field: 'attempts_to_unlock' as keyof KeyNotificationSettings,
      title: t('attemptsToUnlock'),
      description: t('notifyOnFailedUnlockAttempts')
    },
    {
      field: 'security_alerts' as keyof KeyNotificationSettings,
      title: t('securityAlerts'),
      description: t('receiveImportantSecurityAlerts')
    },
    {
      field: 'access_requests' as keyof KeyNotificationSettings,
      title: t('accessRequests'),
      description: t('notifyWhenSomeoneRequestsAccess')
    }
  ];

  return (
    <div className="glass-card mb-4 p-0 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
      {toggleItems.map((item, index) => {
        const isLastItem = index === toggleItems.length - 1;
        // Convert the value to a boolean explicitly to avoid type errors
        const isChecked = Boolean(settings[item.field]);
        
        return (
          <div key={item.field} className={isLastItem ? "" : "border-b border-gray-100 dark:border-gray-700"}>
            <NotificationToggleItem
              title={item.title}
              description={item.description}
              checked={isChecked}
              onCheckedChange={(checked) => onToggleChange(item.field, checked)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default KeyNotificationSettingsPanel;
