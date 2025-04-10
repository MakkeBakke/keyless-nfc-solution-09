
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from './LanguageContext';
import { supabase } from '@/integrations/supabase/client';

type PinSecurityContextType = {
  pin: string | null;
  isPinSet: boolean;
  isVerified: boolean;
  setPin: (newPin: string) => void;
  verifyPin: (enteredPin: string) => boolean;
  requireVerification: () => void;
  clearVerification: () => void;
};

const PinSecurityContext = createContext<PinSecurityContextType | undefined>(undefined);

export const PIN_KEY = 'axiv_security_pin';

export const PinSecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useLanguage();
  const [pin, setStoredPin] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isPinSet, setIsPinSet] = useState(false);
  
  useEffect(() => {
    // Load PIN from localStorage on initial load
    const loadPin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || 'demo-user';
        const storedPin = localStorage.getItem(`${PIN_KEY}_${userId}`);
        
        if (storedPin) {
          setStoredPin(storedPin);
          setIsPinSet(true);
        }
      } catch (error) {
        console.error('Error loading PIN:', error);
      }
    };
    
    loadPin();
  }, []);
  
  const setPin = (newPin: string) => {
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      toast({
        title: t('error'),
        description: t('invalidPin'),
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data: { session } } = supabase.auth.getSession();
      const userId = session?.user?.id || 'demo-user';
      localStorage.setItem(`${PIN_KEY}_${userId}`, newPin);
      setStoredPin(newPin);
      setIsPinSet(true);
      setIsVerified(true);
      
      toast({
        title: t('pinSet'),
        description: t('pinSetSuccessfully'),
      });
    } catch (error) {
      console.error('Error setting PIN:', error);
      toast({
        title: t('error'),
        description: t('failedToSetPin'),
        variant: "destructive",
      });
    }
  };
  
  const verifyPin = (enteredPin: string): boolean => {
    if (enteredPin === pin) {
      setIsVerified(true);
      return true;
    }
    
    toast({
      title: t('error'),
      description: t('incorrectPin'),
      variant: "destructive",
    });
    return false;
  };
  
  const requireVerification = () => {
    setIsVerified(false);
  };
  
  const clearVerification = () => {
    setIsVerified(false);
  };
  
  return (
    <PinSecurityContext.Provider 
      value={{ 
        pin, 
        isPinSet, 
        isVerified, 
        setPin, 
        verifyPin, 
        requireVerification,
        clearVerification
      }}
    >
      {children}
    </PinSecurityContext.Provider>
  );
};

export const usePinSecurity = () => {
  const context = useContext(PinSecurityContext);
  
  if (context === undefined) {
    throw new Error('usePinSecurity must be used within a PinSecurityProvider');
  }
  
  return context;
};
