
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
  simulateTagDetection: (serialNumber?: string) => void;
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
      const errorMessage = 'NFC is not supported on this device or browser';
      console.error(errorMessage);
      setError(errorMessage);
      return false;
    }

    try {
      setIsScanning(true);
      setError(null);
      onReadingRef.current = onReading || null;
      console.log('Starting NFC scan from hook');
      const ndef = await nfcService.startScan(onReading);
      console.log('NFC scan started successfully from hook');
      return true;
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error in useNFC.startScan:', errorMessage);
      setError(errorMessage);
      setIsScanning(false);
      return false;
    }
    // Note: We don't set isScanning to false here because we want
    // to keep scanning until stopScan is called or component unmounts
  };
  
  const stopScan = useCallback(() => {
    console.log('Stopping NFC scan from hook');
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
  
  const simulateTagDetection = useCallback((serialNumber?: string) => {
    console.log('Simulating tag detection from hook');
    nfcService.simulateTagDetection(serialNumber);
  }, []);

  return {
    isSupported,
    isScanning,
    isEmulating,
    error,
    startScan,
    stopScan,
    writeTag,
    emulateNFC,
    simulateTagDetection
  };
}
