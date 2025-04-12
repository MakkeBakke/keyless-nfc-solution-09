
import { TranslationDefinition } from '.';

const english: TranslationDefinition = {
  // General
  save: 'Save',
  cancel: 'Cancel',
  confirm: 'Confirm',
  edit: 'Edit',
  delete: 'Delete',
  error: 'Error',
  success: 'Success',
  loading: 'Loading...',
  unknownKey: 'Unknown Key',
  back: 'Back',
  
  // Authentication
  signIn: 'Sign In',
  signOut: 'Sign Out',
  profile: 'Profile',
  email: 'Email',
  password: 'Password',
  name: 'Name',
  updateProfile: 'Update Profile',
  signedOut: 'Signed Out',
  signedIn: 'Signed In',
  permissions: 'Permissions',
  
  // Navigation
  home: 'Home',
  yourKeys: 'Your Keys',
  activity: 'Activity',
  settings: 'Settings',
  notifications: 'Notifications',
  
  // Settings Page
  appSettings: 'App Settings',
  notificationsSetting: 'Notifications',
  notificationsDesc: 'Enable or disable push notifications',
  biometricAuth: 'Biometric Authentication',
  biometricAuthDesc: 'Enable biometric authentication for added security',
  darkMode: 'Dark Mode',
  darkModeDesc: 'Toggle between light and dark mode',
  deviceManagement: 'Device Management',
  deviceManagementDesc: 'Manage paired devices and NFC settings',
  logout: 'Logout',
  
  // Index Page
  manageKeys: 'Manage your digital keys',
  addNewKey: 'Add New Key',
  refreshKeys: 'Refresh Keys',
  noKeysAdded: 'No Keys Added',
  addFirstKey: 'Add your first digital key to get started',
  addKey: 'Add Key',
  quickTips: 'Quick Tips',
  tipViewDetails: 'Tap on a key to view details and manage settings',
  tipLockUnlock: 'Use the lock/unlock button for quick access',
  tipPairDevice: 'Pair a new device via NFC for enhanced security',
  pairNewDevice: 'Pair New Device',
  connectNFC: 'Connect using NFC for secure pairing',
  failedToLoadKeys: 'Failed to load keys',
  
  // Add Key Modal
  addDigitalKey: 'Add Digital Key',
  keyName: 'Key Name',
  keyType: 'Key Type',
  smartLock: 'Smart Lock',
  digitalCard: 'Digital Card',
  enterKeyName: 'Enter key name',
  selectKeyType: 'Select key type',
  keyNamePlaceholder: 'Front Door, Car, Office, etc.',
  car: 'Car',
  office: 'Office',
  other: 'Other',
  
  // Key Detail Page
  keyDetails: 'Key Details',
  general: 'General',
  keyNameLabel: 'Key Name',
  keyTypeLabel: 'Key Type',
  lastUsedLabel: 'Last Used',
  status: 'Status',
  active: 'Active',
  inactive: 'Inactive',
  security: 'Security',
  configureNFC: 'Configure NFC',
  notificationsSettings: 'Notifications Settings',
  enableNotifications: 'Enable Notifications',
  activityHistory: 'Activity History',
  today: 'Today',
  yesterday: 'Yesterday',
  demohoursago: '2 hours ago',
  keyInformation: 'Key Information',
  securitySettings: 'Security Settings',
  manageSecuritySettings: 'Manage the security settings of your key',
  lockStatus: 'Lock Status',
  pairedOn: 'Paired On',
  viewHistory: 'View History',
  failedToLoadKeyDetails: 'Failed to load key details',
  failedToDeleteKey: 'Failed to delete key',
  
  // Pair Device Page
  pairDevice: 'Pair Device',
  nfcInstructionsTitle: 'NFC Pairing Instructions',
  nfcInstructions: 'Hold your device near the NFC reader to pair. Make sure NFC is enabled in your device settings.',
  pairingSuccessful: 'Pairing Successful',
  devicePairedSuccessfully: 'Device has been successfully paired',
  beforeYouStart: "Before you start",
  makeNFCDeviceActivated: "Make sure your NFC device is activated.",
  enableNFCOnPhone: "Enable NFC on your phone.",
  holdDeviceCloseToPhone: "Hold the device close to your phone.",
  pairYourNFCDevice: "Pair your NFC device",
  couldNotDetectDevice: "Could not detect the device",
  deviceSuccessfullyPaired: "Device successfully paired",
  holdNFCDeviceNearPhone: "Hold your NFC device near your phone",
  startPairing: "Start Pairing",
  mayTakeAFewMoments: "This may take a few moments",
  continue: "Continue",
  tryAgain: "Try Again",
  scanning: "Scanning...",
  pairingFailed: "Pairing Failed",
  deviceNotFound: "Device not found",

  
  // Activity and Key Management
  lastUsed: 'Last used',
  unlock: 'Unlock',
  unlocked: 'Unlocked',
  lock: 'Lock',
  locked: 'Locked',
  paired: 'Paired',
  edited: 'Edited',
  used: 'Used',
  failed: 'Failed',
  
  // Notifications
  noNotifications: 'No Notifications',
  noNotificationsDescription: 'You have no notifications at this time',
  unreadNotification: 'unread notification',
  unreadNotifications: 'unread notifications',
  markAllAsRead: 'Mark all as read',
  notificationsRefreshed: 'Notifications refreshed',
  allNotificationsMarkedAsRead: 'All notifications marked as read',
  failedToMarkAllAsRead: 'Failed to mark all notifications as read',
  frontDoorUnlocked: 'Front Door Unlocked',
  frontDoorUnlockedRemotely: 'Front door was unlocked remotely',
  batteryLow: 'Battery Low',
  officeBatteryLow: 'Office key battery is below 20%',
  newFeatureAvailable: 'New Feature Available',
  checkOutKeySharing: 'Check out the new key sharing functionality',
  keyPaired: '{keyName} Paired',
  keyPairedSuccessfully: 'Key was successfully paired with your account',
  keyEdited: '{keyName} Edited',
  keySettingsChanged: 'Key settings have been updated',
  keyBatteryLow: '{keyName} battery is at {level}%',
  failedToLoadNotifications: 'Failed to load notifications',
  
  // Activity
  recentActivity: 'Recent Activity',
  viewKeyUsage: 'View when your keys were used',
  loadingActivity: 'Loading activity...',
  noActivity: 'No activity recorded yet',
  failedToLoadActivity: 'Failed to load activity data',
  
  // Unlock Animation
  locking: 'Locking',
  unlocking: 'Unlocking',
  securingDevice: 'Ensuring your device is secure',
  accessGranted: 'Access granted successfully',
  
  // Toast Messages
  keyUnlocked: '{keyName} Unlocked',
  successfullyUnlocked: 'Key has been successfully unlocked',
  keyLocked: '{keyName} Locked',
  successfullyLocked: 'Key has been successfully locked',
  failedToUpdateKeyState: 'Failed to update key state',
  
  // Key-related
  keyDeleted: 'Key Deleted',
  keyRemoved: 'Key has been removed from your account',
  batteryLevel: 'Battery Level',
  configureNotifications: 'Configure Notifications',
  deleteKey: 'Delete Key',
  confirmDeleteKey: 'Are you sure you want to delete this key?',
  enterPinToDeleteKey: 'Enter your PIN to delete this key',
  
  // Language
  language: 'Language',
  languageDesc: 'Change application language',
  
  // Key Notifications
  key: 'Key',
  notificationSettings: 'Notification Settings',
  allActivity: 'All Activity',
  allActivityDescription: 'Notify me of all key activity',
  unlockEvents: 'Unlock Events',
  receiveNotificationWhenKeyIsUnlocked: 'Receive notification when key is unlocked',
  lockEvents: 'Lock Events',
  receiveNotificationWhenKeyIsLocked: 'Receive notification when key is locked',
  permissionChanges: 'Permission Changes',
  notifyWhenPermissionChanges: 'Notify when permission changes',
  lowBattery: 'Low Battery',
  notifyWhenBatteryIsLow: 'Notify when battery is low',
  attemptsToUnlock: 'Attempts to Unlock',
  notifyOnFailedUnlockAttempts: 'Notify on failed unlock attempts',
  securityAlerts: 'Security Alerts',
  receiveImportantSecurityAlerts: 'Receive important security alerts',
  accessRequests: 'Access Requests',
  notifyWhenSomeoneRequestsAccess: 'Notify when someone requests access',
  saving: 'Saving...',
  saveSettings: 'Save Settings',
  settingsSaved: 'Settings Saved',
  notificationSettingsUpdated: 'Notification settings updated',
  failedToSaveNotificationSettings: 'Failed to save notification settings',
  failedToLoadNotificationSettings: 'Failed to load notification settings',
  
  // Key Security
  twoFactorAuth: 'Two-Factor Authentication',
  twoFactorAuthDescription: 'Require a second form of verification',
  historyRetention: 'History Retention',
  historyRetentionDescription: 'How long to keep activity history',
  days: 'days',
  unlockNotifications: 'Unlock Notifications',
  unlockNotificationsDescription: 'Get notified when key is unlocked',
  vibrationDetection: 'Vibration Detection',
  vibrationDetectionDescription: 'Detect possible tampering attempts',
  securitySettingsUpdated: 'Security settings updated',
  failedToSaveSecuritySettings: 'Failed to save security settings',
  failedToLoadSecuritySettings: 'Failed to load security settings',
  
  // Key Permissions
  keyPermissions: 'Key Permissions',
  people: 'people',
  invite: 'Invite',
  noUsersHaveAccess: 'No users have access to this key',
  canUnlock: 'Can Unlock',
  canLock: 'Can Lock',
  canViewHistory: 'Can View History',
  invitationSettings: 'Invitation Settings',
  allowNewInvitations: 'Allow New Invitations',
  enableDisableInvitations: 'Enable or disable new invitations',
  requireApproval: 'Require Approval',
  approvePeopleBeforeAccess: 'Approve people before they can access',
  invitePeople: 'Invite People',
  invitePeopleDescription: 'Add friends or family to access this key',
  friendOrFamilyName: 'Friend or Family Name',
  optional: 'optional',
  sending: 'Sending...',
  sendInvite: 'Send Invite',
  
  // Miscellaneous
  keyNotFound: 'Key not found',
  backToHome: 'Back to Home',
  permissionUpdated: 'Permission Updated',
  userPermissionsHaveBeenUpdated: 'User permissions have been updated',
  failedToUpdatePermission: 'Failed to update permission',
  accessRemoved: 'Access Removed',
  userAccessRemoved: 'User access has been removed',
  failedToRemoveAccess: 'Failed to remove access',
  invitationSent: 'Invitation Sent',
  userWillReceiveEmail: 'User will receive an email with instructions',
  userAlreadyHasAccess: 'This user already has access',
  failedToInviteUser: 'Failed to invite user',
  failedToLoadPermissions: 'Failed to load permissions',
  
  // NFC-related messages
  tapToUnlock: 'Tap to Unlock',
  placePhoneNearReader: 'Place phone near reader',
  emulatingNFC: 'Emulating NFC',
  holdPhoneToReader: 'Hold phone to reader',
  nfcNotSupported: 'NFC is not supported',
  useDeviceWithNFC: 'Please use a device with NFC capabilities',
  
  // New error messages for NFC verification
  verificationFailed: 'Verification Failed',
  tryAgainPlacingPhone: 'Please try again by placing your phone closer to the reader',
  unlockFailed: 'Unlock Failed',
  
  // PIN Security related translations
  pinsDontMatch: 'PINs do not match. Please try again.',
  enterSecurityPin: 'Enter Security PIN',
  createSecurityPin: 'Create Security PIN',
  confirmSecurityPin: 'Confirm Security PIN',
  enterPinToAccess: 'Enter your PIN to access this feature',
  createNewPin: 'Create a new 4-digit PIN',
  confirmYourPin: 'Confirm your 4-digit PIN',
  invalidPin: 'Invalid PIN. Must be 4 digits.',
  pinSet: 'PIN Set',
  pinSetSuccessfully: 'Your security PIN has been set successfully',
  failedToSetPin: 'Failed to set PIN',
  incorrectPin: 'Incorrect PIN. Please try again.',
  securityVerification: 'Security Verification',
  enterPinToSaveSettings: 'Enter your PIN to save security settings',
  securityPin: 'Security PIN',
  changePinDesc: 'Change your security PIN',
  setupPinDesc: 'Set up a PIN for additional security'
};

export default english;
