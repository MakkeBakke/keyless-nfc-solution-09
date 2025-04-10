
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Lock } from "lucide-react";
import { usePinSecurity } from '@/contexts/PinSecurityContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';

interface PinVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

const PinVerificationDialog: React.FC<PinVerificationDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title,
  description,
}) => {
  const { t } = useLanguage();
  const { verifyPin, isPinSet, setPin } = usePinSecurity();
  const [pin, setPinValue] = useState("");
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [confirmPin, setConfirmPin] = useState("");
  const [stage, setStage] = useState<'verify' | 'create' | 'confirm'>('verify');
  
  useEffect(() => {
    if (!isPinSet) {
      setStage('create');
      setIsSettingPin(true);
    } else {
      setStage('verify');
      setIsSettingPin(false);
    }
  }, [isPinSet]);
  
  useEffect(() => {
    // Reset values when dialog opens
    if (isOpen) {
      setPinValue("");
      setConfirmPin("");
      
      if (!isPinSet) {
        setStage('create');
        setIsSettingPin(true);
      } else {
        setStage('verify');
      }
    }
  }, [isOpen, isPinSet]);
  
  const handlePinComplete = (value: string) => {
    if (stage === 'verify') {
      if (verifyPin(value)) {
        onSuccess?.();
        onClose();
      }
    } else if (stage === 'create') {
      setPinValue(value);
      setStage('confirm');
      setTimeout(() => setConfirmPin(""), 100);
    } else if (stage === 'confirm') {
      if (value === pin) {
        setPin(value);
        onSuccess?.();
        onClose();
      } else {
        toast({
          title: t('error'),
          description: t('pinsDontMatch'),
          variant: "destructive",
        });
        setStage('create');
        setTimeout(() => setPinValue(""), 100);
      }
    }
  };

  const getTitle = () => {
    if (stage === 'verify') return title || t('enterSecurityPin');
    if (stage === 'create') return t('createSecurityPin');
    return t('confirmSecurityPin');
  };

  const getDescription = () => {
    if (stage === 'verify') return description || t('enterPinToAccess');
    if (stage === 'create') return t('createNewPin');
    return t('confirmYourPin');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-6">
          <InputOTP
            maxLength={4}
            value={stage === 'confirm' ? confirmPin : pin}
            onChange={stage === 'confirm' ? setConfirmPin : setPinValue}
            onComplete={handlePinComplete}
            className="mb-4"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
          
          <Button variant="outline" onClick={onClose} className="mt-4">
            {t('cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PinVerificationDialog;
