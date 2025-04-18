
import { useState } from 'react';
import { nfcService } from '@/services/NFCService';

export interface NFCTagData {
  serialNumber: string;
  data: string | null;
}

export interface NFCEmulationResult {
  success: boolean;
  message: string;
}

export interface NFCHookResult {
  isSupported: boolean;
  isScanning: boolean;
  isEmulating: boolean;
  tagData: NFCTagData | null;
  emulationResult: NFCEmulationResult | null;
  error: string | null;
  startScan: () => Promise<boolean>;
  readTag: () => Promise<NFCTagData | null>;
  writeTag: (data: string) => Promise<boolean>;
  emulateNFC: (keyId: string, nfcData?: string) => Promise<NFCEmulationResult>;
}

export function useNFC(): NFCHookResult {
  const [isScanning, setIsScanning] = useState(false);
  const [isEmulating, setIsEmulating] = useState(false);
  const [tagData, setTagData] = useState<NFCTagData | null>(null);
  const [emulationResult, setEmulationResult] = useState<NFCEmulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSupported = nfcService.isSupported();

  const startScan = async (): Promise<boolean> => {
    if (!isSupported) {
      setError('NFC is not supported on this device or browser');
      return false;
    }

    try {
      setIsScanning(true);
      setError(null);
      const ndef = await nfcService.startScan();
      return true;
    } catch (error) {
      setError((error as Error).message);
      return false;
    } finally {
      setIsScanning(false);
    }
  };

  const readTag = async (): Promise<NFCTagData | null> => {
    if (!isSupported) {
      setError('NFC is not supported on this device or browser');
      return null;
    }

    try {
      setIsScanning(true);
      setError(null);
      const data = await nfcService.readTag();
      setTagData(data);
      return data;
    } catch (error) {
      setError((error as Error).message);
      return null;
    } finally {
      setIsScanning(false);
    }
  };

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

  const emulateNFC = async (keyId: string, nfcData?: string): Promise<NFCEmulationResult> => {
    if (!isSupported) {
      setError('NFC is not supported on this device or browser');
      return { success: false, message: 'NFC is not supported on this device or browser' };
    }

    try {
      setError(null);
      setIsEmulating(true);
      setEmulationResult(null);
      
      const result = await nfcService.emulateNFC(keyId, nfcData);
      setEmulationResult(result);
      return result;
    } catch (error) {
      setError((error as Error).message);
      return { 
        success: false, 
        message: `Error: ${(error as Error).message}` 
      };
    } finally {
      setIsEmulating(false);
    }
  };

  return {
    isSupported,
    isScanning,
    isEmulating,
    tagData,
    emulationResult,
    error,
    startScan,
    readTag,
    writeTag,
    emulateNFC
  };
}
