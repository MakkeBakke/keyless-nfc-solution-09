
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Unlock, Nfc, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface UnlockAnimationProps {
  isLocked?: boolean;
  keyName?: string;
  isNfcWrite?: boolean;
  isNfcEmulation?: boolean;
  failed?: boolean;
}

const UnlockAnimation = ({ 
  isLocked = true, 
  keyName = '', 
  isNfcWrite = false, 
  isNfcEmulation = false,
  failed = false
}: UnlockAnimationProps) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  // Performance optimization: Prevent body scrolling when animation is shown
  useEffect(() => {
    // Disable scrolling on body
    document.body.style.overflow = 'hidden';
    
    // Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Animation variants for consistent, reusable animations
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };
  
  const containerVariants = {
    hidden: { scale: 0.9, y: 10, opacity: 0 },
    visible: { 
      scale: 1, 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 0.1 
      }
    }
  };
  
  const iconVariants = {
    hidden: { rotate: 0, scale: 1 },
    visible: { 
      rotate: [0, 10, 0, -10, 0],
      scale: [1, 1.05, 1, 1.05, 1],
      transition: { 
        duration: 1,
        repeat: 1, 
        repeatDelay: 0.2 
      } 
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.3 } }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 flex items-center justify-center w-full h-full z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop with blur effect */}
        <motion.div 
          className={cn(
            "absolute inset-0 backdrop-blur-md",
            theme === 'dark' 
              ? "bg-gray-900/80" 
              : "bg-white/80"
          )}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
        />
        
        <motion.div 
          className="flex flex-col items-center justify-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Create the pulsing rings animation */}
          <div className="relative flex items-center justify-center mb-6">
            <div className={cn(
              "absolute w-24 h-24 rounded-full animate-pulse-ring",
              failed 
                ? "bg-red-500/20 dark:bg-red-500/10"
                : isNfcWrite || isNfcEmulation
                  ? "bg-axiv-blue/20 dark:bg-axiv-blue/10"
                  : "bg-green-500/20 dark:bg-green-500/10"
            )}></div>
            <div className={cn(
              "absolute w-24 h-24 rounded-full animate-pulse-ring animation-delay-200",
              failed 
                ? "bg-red-500/30 dark:bg-red-500/20"
                : isNfcWrite || isNfcEmulation
                  ? "bg-axiv-blue/30 dark:bg-axiv-blue/20"
                  : "bg-green-500/30 dark:bg-green-500/20"
            )}></div>
            <div className={cn(
              "absolute w-24 h-24 rounded-full animate-pulse-ring animation-delay-400",
              failed 
                ? "bg-red-500/40 dark:bg-red-500/30"
                : isNfcWrite || isNfcEmulation
                  ? "bg-axiv-blue/40 dark:bg-axiv-blue/30"
                  : "bg-green-500/40 dark:bg-green-500/30"
            )}></div>
            
            {/* Place the icon inside the pulsing rings */}
            <motion.div 
              className={cn(
                "relative z-10 w-28 h-28 rounded-full flex items-center justify-center text-white shadow-lg",
                failed 
                  ? "bg-red-500"
                  : isNfcWrite || isNfcEmulation 
                    ? "bg-axiv-blue" 
                    : "bg-green-500"
              )}
              variants={iconVariants}
              initial="hidden"
              animate="visible"
            >
              {failed ? (
                <AlertTriangle size={40} className="drop-shadow-md" />
              ) : isNfcWrite || isNfcEmulation ? (
                <Nfc size={40} className="drop-shadow-md" />
              ) : (
                <ShieldCheck size={40} className="drop-shadow-md" />
              )}
            </motion.div>
          </div>
          
          <motion.div 
            className="text-center"
            variants={textVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.p 
              className="text-xl font-medium mb-2 dark:text-white"
            >
              {failed ? 
                (keyName ? `${t('verificationFailed')} ${keyName}` : t('verificationFailed')) :
                isNfcWrite ? 
                  (keyName ? `${t('nfcWriting')} ${keyName}...` : t('nfcWriting')) :
                  isNfcEmulation ?
                    (keyName ? `${t('emulatingNFC')} ${keyName}...` : t('emulatingNFC')) :
                    (keyName ? `${t('unlocking')} ${keyName}...` : t('unlocking'))}
            </motion.p>
            <motion.p 
              className="text-axiv-gray dark:text-gray-300 text-sm"
            >
              {failed ?
                t('tryAgainPlacingPhone') :
                isNfcWrite ? 
                  t('nfcWriteInstructions') :
                  isNfcEmulation ?
                    t('holdPhoneToReader') :
                    t('accessGranted')}
            </motion.p>
          </motion.div>
          
          {/* Progress indicator - optimize animation */}
          <motion.div
            className="mt-8 w-40 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            <motion.div 
              className={cn(
                "h-full rounded-full",
                failed 
                  ? "bg-red-500"
                  : isNfcWrite || isNfcEmulation 
                    ? "bg-axiv-blue" 
                    : "bg-green-500"
              )}
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UnlockAnimation;
