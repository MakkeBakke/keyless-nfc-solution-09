import { english } from './english';
import swedish from './swedish';
import chinese from './chinese';
import spanish from './spanish';
import german from './german';
import russian from './russian';

export type TranslationKey =
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
  | "couldNotDetectDevice";

const translations = {
  english,
  swedish,
  chinese,
  spanish,
  german,
  russian
};

export default translations;
