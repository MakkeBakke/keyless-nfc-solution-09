
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Nfc, CheckCircle, XCircle } from 'lucide-react';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';
import AddKeyModal from '@/components/AddKeyModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNFC, NFCTagData } from '@/hooks/useNFC';

const PairDevice = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isSupported, isScanning, error: nfcError, readTag } = useNFC();
  
  const [step, setStep] = useState(1);
  const [pairingSuccess, setPairingSuccess] = useState<boolean | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nfcTagData, setNfcTagData] = useState<NFCTagData | null>(null);

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

  useEffect(() => {
    if (step === 2) {
      // Start NFC scanning
      const scanForNFC = async () => {
        try {
          if (!isSupported) {
            console.log('Web NFC API is not supported in this browser');
            setPairingSuccess(false);
            setStep(3);
            setErrorMessage('NFC is not supported on this device or browser.');
            return;
          }

          // Read NFC tag
          const tagData = await readTag();
          
          if (!tagData) {
            setPairingSuccess(false);
            setStep(3);
            setErrorMessage(nfcError || 'Failed to read NFC tag');
            return;
          }
          
          // Store the NFC tag data for later use
          setNfcTagData(tagData);
          console.log("NFC tag detected with serial:", tagData.serialNumber);
          console.log("NFC tag data:", tagData.data);
          
          // Successfully read an NFC tag
          setPairingSuccess(true);
          setStep(3);
          
          // Show a success toast
          toast({
            title: t('pairingSuccessful'),
            description: "NFC device detected and paired successfully",
          });
          
        } catch (error) {
          console.error('Error scanning for NFC:', error);
          setPairingSuccess(false);
          setStep(3);
          setErrorMessage((error as Error).message);
        }
      };

      scanForNFC();
    }
  }, [step, isSupported, nfcError, readTag, t]);

  const beginScanning = async () => {
    setErrorMessage(null);
    setStep(2);
  };

  const resetPairing = () => {
    setStep(1);
    setPairingSuccess(null);
    setErrorMessage(null);
    setNfcTagData(null);
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
    if (!userId || !nfcTagData) {
      // Redirect to profile for login/signup
      toast({
        title: t('error'),
        description: !userId ? "Please log in to add keys" : "NFC data is missing",
        variant: "destructive",
      });
      navigate('/profile');
      return;
    }

    try {
      // Prepare NFC data to store
      // We store serialNumber as nfc_device_id and any additional data in nfc_data field
      // For the demo, we'll store this in a JSON serialized format
      const nfcSerialNumber = nfcTagData.serialNumber;
      const nfcData = nfcTagData.data;

      console.log("Storing NFC data in database:", {
        name: keyName,
        nfc_device_id: nfcSerialNumber,
        nfc_data: nfcData
      });

      // Insert new key into database with NFC data
      const { data, error } = await supabase
        .from('keys')
        .insert({
          name: keyName,
          type: 'Smart Lock',
          user_id: userId,
          battery_level: 100,
          is_active: true,
          is_locked: true,
          nfc_device_id: nfcSerialNumber,
          // If we have custom data from the tag, store it
          nfc_data: nfcData 
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
                onClick={beginScanning}
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
