
/**
 * NFCService - A service for handling NFC operations using the Web NFC API
 */
class NFCService {
  // Check if NFC is supported in this browser/device
  isSupported(): boolean {
    return 'NDEFReader' in window;
  }

  // Request permission and start scanning for NFC tags
  async startScan(): Promise<any> {
    if (!this.isSupported()) {
      throw new Error('NFC is not supported on this device or browser');
    }

    try {
      // @ts-ignore - NDEFReader might not be recognized by TypeScript
      const ndef = new NDEFReader();
      await ndef.scan();
      return ndef;
    } catch (error) {
      console.error('Error starting NFC scan:', error);
      throw error;
    }
  }

  // Read data from an NFC tag and return the serial number and data
  async readTag(): Promise<{ serialNumber: string, data: string | null }> {
    if (!this.isSupported()) {
      throw new Error('NFC is not supported on this device or browser');
    }

    try {
      // @ts-ignore - NDEFReader might not be recognized by TypeScript
      const ndef = new NDEFReader();
      await ndef.scan();
      
      return new Promise((resolve, reject) => {
        // Set up a timeout if no tag is detected
        const timeout = setTimeout(() => {
          reject(new Error('No NFC tag detected within timeout period'));
        }, 15000); // 15 seconds timeout

        ndef.addEventListener("reading", (event: any) => {
          clearTimeout(timeout);
          
          let textData = null;
          // Try to extract text data if available
          if (event.message && event.message.records) {
            for (const record of event.message.records) {
              if (record.recordType === "text") {
                const textDecoder = new TextDecoder();
                textData = textDecoder.decode(record.data);
                break;
              }
            }
          }
          
          // If no text data was found but we have records, try to extract raw data
          if (!textData && event.message && event.message.records && event.message.records.length > 0) {
            const record = event.message.records[0];
            try {
              const textDecoder = new TextDecoder();
              textData = textDecoder.decode(record.data);
            } catch (e) {
              console.warn('Could not decode record data as text:', e);
              // Store a serialized version of the data if text decoding fails
              textData = JSON.stringify({
                recordType: record.recordType,
                mediaType: record.mediaType,
                hasData: !!record.data
              });
            }
          }
          
          // If we still don't have any data, create a unique identifier based on the serial number
          if (!textData) {
            textData = `nfc-id-${event.serialNumber}`;
          }
          
          resolve({
            serialNumber: event.serialNumber,
            data: textData
          });
        });

        ndef.addEventListener("error", (error: any) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
    } catch (error) {
      console.error('Error reading NFC tag:', error);
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

  // Emulate NFC tag reading with stored data
  async emulateNFC(keyId: string, nfcData?: string): Promise<string | null> {
    if (!this.isSupported()) {
      throw new Error('NFC is not supported on this device or browser');
    }
    
    console.log(`Emulating NFC with data: ${nfcData || 'no data provided'}`);
    
    // In a real implementation with native plugins, this would use HCE capabilities
    // For now, we'll simulate sending the actual NFC data after a short delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return the NFC data if available, otherwise just the keyId
        resolve(nfcData || keyId);
      }, 2000);
    });
  }
}

export const nfcService = new NFCService();
