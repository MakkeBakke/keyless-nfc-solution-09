
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Nfc, CheckCircle, XCircle } from 'lucide-react';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';
import AddKeyModal from '@/components/AddKeyModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const PairDevice = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [scanning, setScanning] = useState(false);
  const [pairingSuccess, setPairingSuccess] = useState<boolean | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);
  const [nfcPermissionGranted, setNfcPermissionGranted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nfcDeviceId, setNfcDeviceId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setUserId(session.user.id);
      }
    };

    checkSession();
    checkNfcSupport();
  }, []);

  const checkNfcSupport = async () => {
    try {
      if (!('NDEFReader' in window)) {
        console.log('Web NFC API is not supported in this browser');
        setNfcSupported(false);
        setErrorMessage('NFC is not supported on this device or browser.');
        return;
      }

      setNfcSupported(true);
    } catch (error) {
      console.error('Error checking NFC support:', error);
      setNfcSupported(false);
      setErrorMessage('Error checking NFC support. Please try again.');
    }
  };

  const requestNfcPermission = async () => {
    if (!nfcSupported) return;

    try {
      // @ts-ignore - NDEFReader might not be recognized by TypeScript
      const ndef = new NDEFReader();
      await ndef.scan();
      setNfcPermissionGranted(true);
      return true;
    } catch (error) {
      console.error('Error requesting NFC permission:', error);
      setNfcPermissionGranted(false);
      if ((error as Error).name === 'NotAllowedError') {
        setErrorMessage('NFC permission denied. Please enable NFC permissions and try again.');
      } else if ((error as Error).name === 'NotSupportedError') {
        setErrorMessage('NFC is not supported on this device.');
      } else {
        setErrorMessage('Error accessing NFC. Please make sure NFC is enabled on your device.');
      }
      return false;
    }
  };

  useEffect(() => {
    if (step === 2 && scanning) {
      let nfcTimeout: NodeJS.Timeout;
      let nfcDetected = false;

      const scanForNfc = async () => {
        try {
          if (!nfcSupported) {
            // Stop the process if NFC is not supported
            setScanning(false);
            setPairingSuccess(false);
            setStep(3);
            return;
          }

          // Real NFC scanning
          // @ts-ignore - NDEFReader might not be recognized by TypeScript
          const ndef = new NDEFReader();

          ndef.addEventListener("reading", (event: any) => {
            console.log("NFC tag detected!");
            console.log("Serial number:", event.serialNumber);
            
            // Store the NFC identifier for later use
            setNfcDeviceId(event.serialNumber);

            // Successfully read an NFC tag
            nfcDetected = true;
            setScanning(false);
            setPairingSuccess(true);
            setStep(3);
            
            // Show a success toast
            toast({
              title: t('pairingSuccessful'),
              description: "NFC device detected and paired successfully",
            });
          });

          ndef.addEventListener("error", (error: any) => {
            console.error(`NFC Error: ${error.message}`);
            if (!nfcDetected) {
              setScanning(false);
              setPairingSuccess(false);
              setStep(3);
            }
          });

          await ndef.scan();

          // Set a timeout for the scanning process
          nfcTimeout = setTimeout(() => {
            if (!nfcDetected) {
              setScanning(false);
              setPairingSuccess(false);
              setStep(3);
            }
          }, 10000); // 10 seconds timeout

        } catch (error) {
          console.error('Error scanning for NFC:', error);
          setScanning(false);
          setPairingSuccess(false);
          setStep(3);
        }
      };

      scanForNfc();

      return () => {
        if (nfcTimeout) clearTimeout(nfcTimeout);
      };
    }
  }, [step, scanning, nfcSupported, t]);

  const startScanning = async () => {
    setErrorMessage(null);

    // Request NFC permission if supported
    if (nfcSupported && !nfcPermissionGranted) {
      const permissionGranted = await requestNfcPermission();
      if (!permissionGranted) {
        // Don't proceed if permission was denied
        return;
      }
    }

    setScanning(true);
  };

  const resetPairing = () => {
    setStep(1);
    setScanning(false);
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
          nfc_device_id: nfcDeviceId // Store the NFC device ID
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
              {step === 2 && scanning && (
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
                    scanning ? "text-axiv-blue animate-pulse" : "text-axiv-blue"
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

            {nfcSupported === false && step === 1 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                <p>NFC is not supported on this device or browser. Please use a compatible device.</p>
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
                onClick={() => {
                  setStep(2);
                  startScanning();
                }}
                className="w-full py-3 bg-axiv-blue text-white rounded-xl hover:bg-axiv-blue/90 transition-colors"
              >
                {t('startPairing')}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-axiv-blue border-t-transparent mb-4"></div>
              <p className="text-sm text-axiv-gray">{t('mayTakeAFewMoments')}</p>
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
