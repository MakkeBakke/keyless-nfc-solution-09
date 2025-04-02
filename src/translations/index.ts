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
  | "demohoursago";   


const translations = {
  english,
  swedish,
  chinese,
  spanish,
  german,
  russian
};

export default translations;
