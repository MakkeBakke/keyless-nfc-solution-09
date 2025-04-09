
import { english } from './english';
import swedish from './swedish';
import chinese from './chinese';
import spanish from './spanish';
import german from './german';
import russian from './russian';

export type TranslationKey =
  | 'home'
  | 'profile'
  | 'settings'
  | 'unlocked'
  | 'locked'
  | 'addNewKey'
  | 'keyName'
  | 'keyNamePlaceholder'
  | 'addKey'
  | 'back'
  | 'failedToLoadKeys'
  | 'yourKeys'
  | 'manageKeys'
  | 'refreshKeys'
  | 'noKeysAdded'
  | 'addFirstKey'
  | 'quickTips'
  | 'tipViewDetails'
  | 'tipLockUnlock'
  | 'tipPairDevice'
  | 'connectNFC'
  | "loading"
  | "key"
  | "security"
  | "name"
  | "keyType"
  | "email"
  | "error"
  | "lastUsed"
  | "batteryLevel"
  | "minutes"
  | "days"
  | "people"
  | "optional"
  | "save"
  | "cancel"
  | "confirm"
  | "pairDevice"
  | "pairNewDevice"
  | "scanning"
  | "pairYourNFCDevice"
  | "holdNFCDeviceNearPhone"
  | "beforeYouStart"
  | "makeNFCDeviceActivated"
  | "enableNFCOnPhone"
  | "holdDeviceCloseToPhone"
  | "startPairing"
  | "mayTakeAFewMoments"
  | "continue"
  | "tryAgain"
  | "keyAdded"
  | "hasBeenAddedToYourKeys"
  | "failedToAddKey"
  | "pairingFailed"
  | "deviceSuccessfullyPaired"
  | "couldNotDetectDevice"
  | "permissions"
  | "keyNotFound"
  | "backToHome"
  | "keyPermissions"
  | "invite"
  | "noUsersHaveAccess"
  | "invitationSettings"  
  | "allowNewInvitations"  
  | "enableDisableInvitations"  
  | "requireApproval"
  | "approvePeopleBeforeAccess"
  | "failedToLoadPermissions"
  | "demohoursago"
  | "locking"
  | "unlocking"
  | "securingDevice"
  | "accessGranted"
  | "unknown"
  | "unlocked"
  | "lock"
  | "unlock"
  | "active"
  | "inactive"
  | "status"
  | "lockStatus"
  | "pairedOn"
  | "keyInformation"
  | "securitySettings"
  | "manageSecuritySettings"
  | "notifications"
  | "configureNotifications"
  | "recentActivity"
  | "viewHistory"
  | "noActivity"
  | "deleteKey"
  | "confirmDeleteKey"
  | "delete"
  | "failedToUpdateKeyState"
  | "keyDeleted"
  | "keyRemoved"
  | "keyUnlocked"
  | "keyLocked"
  | "failedToLoadKeyDetails"
  | "successfullyUnlocked"
  | "successfullyLocked"
  | "failedToDeleteKey"
  | "unknownKey"
  | "unlocked"
  | "locked"
  | "keyPaired"
  | "keyPairedSuccessfully"
  | "keyEdited"
  | "keySettingsChanged"
  | "batteryLow"
  | "keyBatteryLow"
  | "newFeatureAvailable"
  | "checkOutKeySharing"
  | "failedToLoadNotifications"
  | "notificationsRefreshed"
  | "allNotificationsMarkedAsRead"
  | "failedToMarkAllAsRead"
  | "notificationsDesc"
  | "noNotifications"
  | "noNotificationsDescription"
  | "unreadNotification"
  | "unreadNotifications"
  | "markAllAsRead"
  | "frontDoorUnlocked"
  | "frontDoorUnlockedRemotely"
  | "officeBatteryLow"
  | "pairingSuccessful"
  | "signOut"
  | "darkMode"
  | "biometricAuth"
  | "appSettings"
  | "signIn"
  | "darkModeDesc"
  | "biometricAuthDesc"
  | "notificationsDesc"
  | "deviceManagement"
  | "deviceManagementDesc"
  | "logout"
  | "today"
  | "yesterday"
  | "activity"
  | "recentActivity"
  | "viewKeyUsage"
  | "loadingActivity"
  | "canUnlock"
  | "canLock"
  | "canViewHistory"
  | "failedToLoadActivity"
  | "failedToInviteUser"
  | "userWillReceiveEmail"
  | "invitationSent"
  | "userAlreadyHasAccess"
  | "invitePeople"
  | "invitePeopleDescription"
  | "friendOrFamilyName"
  | "sending"
  | "sendInvite"
  | "language"
  | "languageDesc"
  | "permissionUpdated"
  | "userPermissionsHaveBeenUpdated"
  | "failedToUpdatePermission"
  | "accessRemoved"
  | "userAccessRemoved"
  | "failedToRemoveAccess"
  | "invitePeople"
  | "invitePeopleDescription"
  | "friendOrFamilyName"
  | "sending"
  | "sendInvite"
  | "allActivity"
  | "allActivityDescription"
  | "unlockEvents"
  | "receiveNotificationWhenKeyIsUnlocked"
  | "lockEvents"
  | "receiveNotificationWhenKeyIsLocked"
  | "permissionChanges"
  | "notifyWhenPermissionChanges"
  | "lowBattery"
  | "notifyWhenBatteryIsLow"
  | "attemptsToUnlock"
  | "notifyOnFailedUnlockAttempts"
  | "securityAlerts"
  | "receiveImportantSecurityAlerts"
  | "accessRequests"
  | "notifyWhenSomeoneRequestsAccess"
  | "saving"
  | "saveSettings"
  | "settingsSaved"
  | "notificationSettingsUpdated"
  | "failedToSaveNotificationSettings"
  | "failedToLoadNotificationSettings"
  | "notificationSettings"
  | "autoLock"
  | "autoLockDescription"
  | "autoLockDelay"
  | "geofencing"
  | "geofencingDescription"
  | "twoFactorAuth"
  | "twoFactorAuthDescription"
  | "historyRetention"
  | "historyRetentionDescription"
  | "unlockNotifications"
  | "unlockNotificationsDescription"
  | "vibrationDetection"
  | "vibrationDetectionDescription"
  | "securitySettingsUpdated"
  | "failedToSaveSecuritySettings"
  | "failedToLoadSecuritySettings"
  | "nfcWriting"
  | "nfcWriteSuccess"
  | "nfcWriteError"
  | "holdKeyToUnlock"
  | "presentPhoneToLock"
  | "nfcWriteInstructions"
  | "nfcSuccessfullyWritten"
  | "nfcWriteFailed"
  | "unlocked"
  | "paired"
  | "edited"
  | "used"
  | "failed"
  | "tapToUnlock"
  | "placePhoneNearReader"
  | "emulatingNFC"
  | "holdPhoneToReader"
  | "nfcNotSupported"
  | "useDeviceWithNFC"
  // Add the missing translation keys needed for the invitation email
  | "invitationToAccessKey"
  | "youveBeenInvited"
  | "someone"
  | "hasInvitedYouToAccessKey"
  | "youCanNowAccess"
  | "unlockTheKey"
  | "lockTheKey"
  | "viewKeyHistory"
  | "toGetStarted"
  | "openApp"
  | "permissionsAddedButEmailFailed";

const translations = {
  english,
  swedish,
  chinese,
  spanish,
  german,
  russian
};

export default translations;
