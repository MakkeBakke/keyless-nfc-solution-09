
/**
 * NFCService - A service for handling NFC operations using the Web NFC API
 */
class NFCService {
  private ndefReader: NDEFReader | null = null;
  private readingListeners: Array<(event: any) => void> = [];

  // Check if NFC is supported in this browser/device
  isSupported(): boolean {
    return 'NDEFReader' in window;
  }

  // Request permission and start scanning for NFC tags
  async startScan(onReading?: (event: any) => void): Promise<NDEFReader> {
    if (!this.isSupported()) {
      throw new Error('NFC is not supported on this device or browser');
    }

    try {
      // @ts-ignore - NDEFReader might not be recognized by TypeScript
      this.ndefReader = new NDEFReader();
      await this.ndefReader.scan();
      console.log('NFC scan started successfully');
      
      if (onReading) {
        this.readingListeners.push(onReading);
        this.ndefReader.addEventListener("reading", onReading);
      }
      
      return this.ndefReader;
    } catch (error) {
      console.error('Error starting NFC scan:', error);
      throw error;
    }
  }

  // Write data to an NFC tag
  async writeTag(textData: string): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('NFC is not supported on this device or browser');
    }

    try {
      // @ts-ignore - NDEFReader might not be recognized by TypeScript
      const ndef = new NDEFReader();
      await ndef.write({
        records: [{ recordType: "text", data: textData }]
      });
      console.log('Successfully wrote to NFC tag');
    } catch (error) {
      console.error('Error writing to NFC tag:', error);
      throw error;
    }
  }

  // Stop scanning for NFC tags
  stopScan(): void {
    if (this.ndefReader) {
      // Clean up event listeners
      this.readingListeners.forEach(listener => {
        this.ndefReader?.removeEventListener("reading", listener);
      });
      this.readingListeners = [];
      console.log('NFC scanning stopped');
      this.ndefReader = null;
    }
  }

  // Emulate NFC tag reading - since browser-based emulation isn't fully supported,
  // this is more of a simulation for the app's UI flow
  async emulateNFC(keyId: string): Promise<string> {
    // In a real implementation with native plugins, this would use HCE capabilities
    // For now, we'll simulate the success case after a short delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(keyId);
      }, 2000);
    });
  }
}

export const nfcService = new NFCService();
