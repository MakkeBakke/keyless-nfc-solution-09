
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Nfc, CheckCircle, XCircle, Smartphone } from 'lucide-react';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';
import AddKeyModal from '@/components/AddKeyModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNFC } from '@/hooks/useNFC';
import { Button } from '@/components/ui/button';

const PairDevice = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isSupported, isScanning, error: nfcError, startScan, stopScan, simulateTagDetection } = useNFC();
  
  const [step, setStep] = useState(1);
  const [pairingSuccess, setPairingSuccess] = useState<boolean | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nfcDeviceId, setNfcDeviceId] = useState<string | null>(null);
  const [scanTimeout, setScanTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setUserId(session.user.id);
      }
    };

    checkSession();
  }, []);

  // Handle NFC reading events
  const handleNfcReading = useCallback((event: any) => {
    console.log("NFC tag detected in PairDevice!", event);
    console.log("Serial number:", event.serialNumber);
    
    // Store the NFC identifier for later use
    setNfcDeviceId(event.serialNumber);

    // Successfully read an NFC tag
    setPairingSuccess(true);
    setStep(3);
    
    // Show a success toast
    toast({
      title: t('pairingSuccessful'),
      description: "NFC device detected and paired successfully",
    });
    
    // Stop scanning as we've successfully read a tag
    stopScan();
    
    // Clear any existing timeout
    if (scanTimeout) {
      clearTimeout(scanTimeout);
      setScanTimeout(null);
    }
  }, [stopScan, t, scanTimeout]);

  useEffect(() => {
    if (step === 2) {
      // Set up the NFC reader
      const setupNFC = async () => {
        try {
          if (!isSupported) {
            console.log('Web NFC API is not supported in this browser');
            setPairingSuccess(false);
            setStep(3);
            setErrorMessage('NFC is not supported on this device or browser.');
            return;
          }

          // Start scanning with our reading handler
          console.log('Starting NFC scan in PairDevice component');
          const scanStarted = await startScan(handleNfcReading);
          
          if (!scanStarted) {
            console.error('Failed to start NFC scanning');
            setPairingSuccess(false);
            setStep(3);
            setErrorMessage(nfcError || 'Failed to start NFC scanning');
            return;
          }
          
          console.log('NFC scan started successfully in PairDevice component');
          
          // Setup a timeout to handle no NFC tags detected
          const timeout = setTimeout(() => {
            if (step === 2) {
              console.log('NFC scan timeout - no tag detected');
              stopScan();
              setPairingSuccess(false);
              setStep(3);
              setErrorMessage('No NFC tag was detected. Please try again.');
            }
          }, 30000); // 30 seconds timeout (increased from 10s)
          
          setScanTimeout(timeout);
          
          return () => {
            clearTimeout(timeout);
            stopScan();
          };
          
        } catch (error) {
          console.error('Error scanning for NFC:', error);
          setPairingSuccess(false);
          setStep(3);
          setErrorMessage((error as Error).message);
        }
      };

      setupNFC();
    }
    
    return () => {
      if (isScanning) {
        stopScan();
      }
      
      if (scanTimeout) {
        clearTimeout(scanTimeout);
      }
    };
  }, [step, isSupported, isScanning, nfcError, startScan, stopScan, handleNfcReading, scanTimeout]);

  const beginScanning = async () => {
    setErrorMessage(null);
    setStep(2);
  };

  const resetPairing = () => {
    setStep(1);
    setPairingSuccess(null);
    setErrorMessage(null);
  };

  const finishPairing = () => {
    // Only show the add key modal if pairing was successful
    if (pairingSuccess) {
      setShowAddModal(true);
    } else {
      navigate('/');
    }
  };
  
  // For testing in browsers or devices without NFC, simulate tag detection
  const handleSimulatePairing = () => {
    simulateTagDetection(`simulated-${Date.now()}`);
  };

  const handleAddKey = async (keyName: string) => {
    if (!userId) {
      // Redirect to profile for login/signup
      navigate('/profile');
      return;
    }

    try {
      // Insert new key into database
      const { data, error } = await supabase
        .from('keys')
        .insert({
          name: keyName,
          type: 'Smart Lock',
          user_id: userId,
          battery_level: 100,
          is_active: true,
          is_locked: true,
          nfc_device_id: nfcDeviceId || `simulated-${Date.now()}` // Store the NFC device ID or generate a simulated one
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Log activity
      await supabase
        .from('key_activity')
        .insert({
          key_id: data.id,
          user_id: userId,
          action: 'paired'
        });

      toast({
        title: t('keyAdded'),
        description: `${keyName} ${t('hasBeenAddedToYourKeys')}`,
      });

      // Navigate back to the home page
      navigate('/');
    } catch (error) {
      console.error('Error adding key:', error);
      toast({
        title: t('error'),
        description: t('failedToAddKey'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-24 px-4">
      <Header title={t('pairDevice')} showBackButton />

      <div className="max-w-md mx-auto">
        <div className="glass-card p-6 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="relative">
              {step === 2 && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute w-16 h-16 rounded-full bg-axiv-blue/20 animate-pulse-ring"></div>
                    <div className="absolute w-16 h-16 rounded-full bg-axiv-blue/40 animate-pulse-ring animation-delay-200"></div>
                    <div className="absolute w-16 h-16 rounded-full bg-axiv-blue/60 animate-pulse-ring animation-delay-400"></div>
                  </div>
                </>
              )}

              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center z-10 relative",
                step === 3
                  ? pairingSuccess
                    ? "bg-green-500/10"
                    : "bg-red-500/10"
                  : "bg-axiv-blue/10"
              )}>
                {step === 3 ? (
                  pairingSuccess ? (
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  ) : (
                    <XCircle className="w-10 h-10 text-red-500" />
                  )
                ) : (
                  <Nfc className={cn(
                    "w-10 h-10 transition-all",
                    step === 2 ? "text-axiv-blue animate-pulse" : "text-axiv-blue"
                  )} />
                )}
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-axiv-gray">
              {step === 1 && t('pairYourNFCDevice')}
              {step === 2 && t('holdNFCDeviceNearPhone')}
              {step === 3 &&
                (pairingSuccess
                  ? t('deviceSuccessfullyPaired')
                  : t('couldNotDetectDevice'))}
            </p>

            {errorMessage && (
              <p className="text-red-500 mt-2 text-sm">{errorMessage}</p>
            )}

            {!isSupported && step === 1 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                <p>NFC is not supported on this device or browser. Please use a compatible device or use the simulation option below for testing.</p>
              </div>
            )}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-axiv-light-gray p-4 rounded-xl">
                <h3 className="font-medium mb-2">{t('beforeYouStart')}:</h3>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="inline-block w-4 h-4 bg-axiv-blue rounded-full text-white flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                    <p>{t('makeNFCDeviceActivated')}</p>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-4 h-4 bg-axiv-blue rounded-full text-white flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                    <p>{t('enableNFCOnPhone')}</p>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-4 h-4 bg-axiv-blue rounded-full text-white flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                    <p>{t('holdDeviceCloseToPhone')}</p>
                  </li>
                </ul>
              </div>

              <button
                onClick={beginScanning}
                className="w-full py-3 bg-axiv-blue text-white rounded-xl hover:bg-axiv-blue/90 transition-colors"
              >
                {t('startPairing')}
              </button>
              
              <div className="pt-2 border-t border-gray-200">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleSimulatePairing}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Simulate NFC Tag (Testing)</span>
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  For testing purposes when physical NFC tag is not available
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-axiv-blue border-t-transparent mb-4"></div>
              <p className="text-sm text-axiv-gray">{t('mayTakeAFewMoments')}</p>
              <Button 
                variant="ghost" 
                className="mt-4" 
                onClick={handleSimulatePairing}
              >
                Simulate Tag (for testing)
              </Button>
              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={() => {
                  stopScan();
                  resetPairing();
                }}
              >
                Cancel
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              {pairingSuccess ? (
                <button
                  onClick={finishPairing}
                  className="w-full py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                >
                  {t('continue')}
                </button>
              ) : (
                <button
                  onClick={resetPairing}
                  className="w-full py-3 bg-axiv-blue text-white rounded-xl hover:bg-axiv-blue/90 transition-colors"
                >
                  {t('tryAgain')}
                </button>
              )}

              <button
                onClick={() => navigate('/')}
                className="w-full py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          )}
        </div>
      </div>

      <AddKeyModal
        isOpen={showAddModal}
        onClose={() => navigate('/')}
        onAdd={handleAddKey}
      />
    </div>
  );
};

export default PairDevice;
