
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ddbfed94a16b46a1b25ca1d90fac969a',
  appName: 'keyless-nfc-solution',
  webDir: 'dist',
  server: {
    url: 'https://ddbfed94-a16b-46a1-b25c-a1d90fac969a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    HCEPlugin: {
      nfcCardEmulation: {
        aid: "F0010203040506",
        category: "payment",
        displayName: "Keyless NFC Solution"
      }
    }
  }
};

export default config;
