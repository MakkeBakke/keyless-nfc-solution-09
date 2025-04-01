
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Nfc, CheckCircle, XCircle } from 'lucide-react';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';

const PairDevice = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [scanning, setScanning] = useState(false);
  const [pairingSuccess, setPairingSuccess] = useState<boolean | null>(null);
  
  useEffect(() => {
    if (step === 2 && scanning) {
      const timer = setTimeout(() => {
        setScanning(false);
        setPairingSuccess(Math.random() > 0.2); // 80% success chance for demo
        setStep(3);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [step, scanning]);
  
  const startScanning = () => {
    setScanning(true);
  };
  
  const resetPairing = () => {
    setStep(1);
    setScanning(false);
    setPairingSuccess(null);
  };
  
  const finishPairing = () => {
    navigate('/');
  };
  
  return (
    <div className="min-h-screen pb-24 pt-24 px-4">
      <Header title="Pair Device" showBackButton />
      
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
            <h2 className="text-2xl font-medium mb-2">
              {step === 1 && "Pair New Device"}
              {step === 2 && "Scanning..."}
              {step === 3 && (pairingSuccess ? "Pairing Successful" : "Pairing Failed")}
            </h2>
            <p className="text-axiv-gray">
              {step === 1 && "Pair your NFC-compatible device with Axiv"}
              {step === 2 && "Hold your NFC device near your phone"}
              {step === 3 && (pairingSuccess 
                ? "Your device has been successfully paired"
                : "We couldn't detect your device. Please try again."
              )}
            </p>
          </div>
          
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-axiv-light-gray p-4 rounded-xl">
                <h3 className="font-medium mb-2">Before you start:</h3>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="inline-block w-4 h-4 bg-axiv-blue rounded-full text-white flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                    Make sure your NFC device is activated
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-4 h-4 bg-axiv-blue rounded-full text-white flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                    Enable NFC on your phone
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-4 h-4 bg-axiv-blue rounded-full text-white flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                    Hold the device close to your phone during scanning
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
                Start Pairing
              </button>
            </div>
          )}
          
          {step === 2 && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-axiv-blue border-t-transparent mb-4"></div>
              <p className="text-sm text-axiv-gray">This may take a few moments...</p>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-3">
              {pairingSuccess ? (
                <button 
                  onClick={finishPairing}
                  className="w-full py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button 
                  onClick={resetPairing}
                  className="w-full py-3 bg-axiv-blue text-white rounded-xl hover:bg-axiv-blue/90 transition-colors"
                >
                  Try Again
                </button>
              )}
              
              <button 
                onClick={() => navigate('/')}
                className="w-full py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PairDevice;
