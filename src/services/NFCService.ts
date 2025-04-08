
/**
 * NFCService - A service for handling NFC operations using the Web NFC API
 */
class NFCService {
  private ndefReader: NDEFReader | null = null;
  private readingListeners: Array<(event: any) => void> = [];
  private isReading: boolean = false;

  // Check if NFC is supported in this browser/device
  isSupported(): boolean {
    const supported = 'NDEFReader' in window;
    console.log('NFC supported:', supported);
    return supported;
  }

  // Request permission and start scanning for NFC tags
  async startScan(onReading?: (event: any) => void): Promise<NDEFReader> {
    if (!this.isSupported()) {
      console.error('NFC is not supported on this device or browser');
      throw new Error('NFC is not supported on this device or browser');
    }

    try {
      if (this.isReading) {
        console.log('NFC scan already in progress');
        // If already scanning, just add the listener and return the current reader
        if (onReading && this.ndefReader) {
          this.readingListeners.push(onReading);
          this.ndefReader.addEventListener("reading", onReading);
        }
        return this.ndefReader!;
      }

      console.log('Starting NFC scan...');
      
      // @ts-ignore - NDEFReader might not be recognized by TypeScript
      this.ndefReader = new NDEFReader();
      
      // Add error event listener
      this.ndefReader.addEventListener("readingerror", (event: any) => {
        console.error('NFC reading error:', event);
      });
      
      // Add a generic reading listener for debugging
      const debugListener = (event: any) => {
        console.log('NFC tag detected!', event);
        console.log('Serial number:', event.serialNumber);
        if (event.message) {
          console.log('Message records:', event.message.records);
        }
      };
      
      this.ndefReader.addEventListener("reading", debugListener);
      
      // Start the actual scan
      await this.ndefReader.scan();
      this.isReading = true;
      console.log('NFC scan started successfully');
      
      if (onReading) {
        this.readingListeners.push(onReading);
        this.ndefReader.addEventListener("reading", onReading);
      }
      
      return this.ndefReader;
    } catch (error) {
      console.error('Error starting NFC scan:', error);
      // Check for permission errors specifically
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        throw new Error('NFC permission denied. Please enable NFC permissions for this app.');
      } else if (error instanceof DOMException && error.name === 'NotSupportedError') {
        throw new Error('NFC is not supported or is disabled on this device.');
      }
      throw error;
    }
  }

  // Write data to an NFC tag
  async writeTag(textData: string): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('NFC is not supported on this device or browser');
    }

    try {
      console.log('Attempting to write to NFC tag:', textData);
      // @ts-ignore - NDEFReader might not be recognized by TypeScript
      const ndef = new NDEFReader();
      await ndef.write({
        records: [{ recordType: "text", data: textData }]
      });
      console.log('Successfully wrote to NFC tag');
    } catch (error) {
      console.error('Error writing to NFC tag:', error);
      // Check for permission errors specifically
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        throw new Error('NFC permission denied. Please enable NFC permissions for this app.');
      } else if (error instanceof DOMException && error.name === 'NotSupportedError') {
        throw new Error('NFC is not supported or is disabled on this device.');
      }
      throw error;
    }
  }

  // Stop scanning for NFC tags
  stopScan(): void {
    if (this.ndefReader) {
      console.log('Stopping NFC scan');
      // Clean up event listeners
      this.readingListeners.forEach(listener => {
        this.ndefReader?.removeEventListener("reading", listener);
      });
      this.readingListeners = [];
      this.isReading = false;
      console.log('NFC scanning stopped');
      this.ndefReader = null;
    }
  }

  // Emulate NFC tag reading - since browser-based emulation isn't fully supported,
  // this is more of a simulation for testing the app's UI flow
  async emulateNFC(keyId: string): Promise<string> {
    console.log('Emulating NFC with key ID:', keyId);
    
    // On Android devices with actual NFC hardware, this would be
    // replaced with real NFC operations. For now, we'll simulate success
    // after a short delay to test the app flow.
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('NFC emulation complete');
        resolve(keyId);
      }, 2000);
    });
  }
  
  // For debug purposes - immediately simulate an NFC tag detection
  simulateTagDetection(serialNumber: string = 'simulated-tag-123'): void {
    if (!this.readingListeners.length) {
      console.warn('No reading listeners registered for simulated tag detection');
      return;
    }
    
    console.log('Simulating NFC tag detection with serial:', serialNumber);
    
    // Create a simulated event object
    const simulatedEvent = {
      serialNumber: serialNumber,
      message: {
        records: [
          {
            recordType: "text",
            data: "Simulated NFC Tag"
          }
        ]
      }
    };
    
    // Call all registered listeners with the simulated event
    this.readingListeners.forEach(listener => {
      listener(simulatedEvent);
    });
  }
}

export const nfcService = new NFCService();
