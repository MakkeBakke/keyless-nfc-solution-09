import { useState, useEffect, useCallback, useRef } from 'react';
import { nfcService } from '@/services/NFCService';

export interface NFCHookResult {
  isSupported: boolean;
  isScanning: boolean;
  isEmulating: boolean;
  error: string | null;
  startScan: (onReading?: (event: any) => void) => Promise<boolean>;
  stopScan: () => void;
  writeTag: (data: string) => Promise<boolean>;
  emulateNFC: (keyId: string) => Promise<string | null>;
}

export function useNFC(): NFCHookResult {
  const [isScanning, setIsScanning] = useState(false);
  const [isEmulating, setIsEmulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onReadingRef = useRef<((event: any) => void) | null>(null);
  
  const isSupported = nfcService.isSupported();
  
  useEffect(() => {
    return () => {
      if (isScanning) {
        nfcService.stopScan();
      }
    };
  }, [isScanning]);

  const startScan = async (onReading?: (event: any) => void): Promise<boolean> => {
    if (!isSupported) {
      setError('NFC is not supported on this device or browser');
      return false;
    }

    try {
      setIsScanning(true);
      setError(null);
      onReadingRef.current = onReading || null;
      const ndef = await nfcService.startScan(onReading);
      return true;
    } catch (error) {
      setError((error as Error).message);
      return false;
    }
    // Note: We don't set isScanning to false here because we want
    // to keep scanning until stopScan is called or component unmounts
  };
  
  const stopScan = useCallback(() => {
    nfcService.stopScan();
    setIsScanning(false);
  }, []);

  const writeTag = async (data: string): Promise<boolean> => {
    if (!isSupported) {
      setError('NFC is not supported on this device or browser');
      return false;
    }

    try {
      setError(null);
      await nfcService.writeTag(data);
      return true;
    } catch (error) {
      setError((error as Error).message);
      return false;
    }
  };

  const emulateNFC = async (keyId: string): Promise<string | null> => {
    if (!isSupported) {
      setError('NFC is not supported on this device or browser');
      return null;
    }

    try {
      setError(null);
      setIsEmulating(true);
      const result = await nfcService.emulateNFC(keyId);
      return result;
    } catch (error) {
      setError((error as Error).message);
      return null;
    } finally {
      setIsEmulating(false);
    }
  };

  return {
    isSupported,
    isScanning,
    isEmulating,
    error,
    startScan,
    stopScan,
    writeTag,
    emulateNFC
  };
}
