
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ddbfed94a16b46a1b25ca1d90fac969a',
  appName: 'keyless-nfc-solution',
  webDir: 'dist',
  server: {
    url: 'https://ddbfed94-a16b-46a1-b25c-a1d90fac969a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: 'keyless-app.keystore',
      keystoreAlias: 'keylessapp',
      releaseType: 'AAB'
    }
  }
};

export default config;
