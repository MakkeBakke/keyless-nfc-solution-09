
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LockKeyhole, KeyRound, ShieldCheck, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface UnlockAnimationProps {
  isLocked?: boolean;
  keyName?: string;
}

const UnlockAnimation = ({ isLocked = true, keyName = '' }: UnlockAnimationProps) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  // Use effect to prevent body scrolling when animation is shown
  useEffect(() => {
    // Disable scrolling on body
    document.body.style.overflow = 'hidden';
    
    // Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        <motion.div 
          className="flex flex-col items-center justify-center relative z-10"
          initial={{ scale: 0.9, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.1 
          }}
        >
          {/* Create the pulsing rings animation */}
          <div className="relative flex items-center justify-center mb-6">
            <div className={cn(
              "absolute w-24 h-24 rounded-full animate-pulse-ring",
              isLocked 
                ? "bg-red-500/20 dark:bg-red-500/10" 
                : "bg-green-500/20 dark:bg-green-500/10"
            )}></div>
            <div className={cn(
              "absolute w-24 h-24 rounded-full animate-pulse-ring animation-delay-200",
              isLocked 
                ? "bg-red-500/30 dark:bg-red-500/20" 
                : "bg-green-500/30 dark:bg-green-500/20"
            )}></div>
            <div className={cn(
              "absolute w-24 h-24 rounded-full animate-pulse-ring animation-delay-400",
              isLocked 
                ? "bg-red-500/40 dark:bg-red-500/30" 
                : "bg-green-500/40 dark:bg-green-500/30"
            )}></div>
            
            {/* Place the icon inside the pulsing rings */}
            <motion.div 
              className={cn(
                "relative z-10 w-28 h-28 rounded-full flex items-center justify-center text-white shadow-lg",
                isLocked ? "bg-red-500" : "bg-green-500"
              )}
              initial={{ rotate: 0 }}
              animate={{ 
                rotate: isLocked ? [0, -10, 0, 10, 0] : [0, 10, 0, -10, 0],
                scale: [1, 1.05, 1, 1.05, 1]
              }}
              transition={{ 
                duration: 1, 
                repeat: 1, 
                repeatDelay: 0.2 
              }}
            >
              {isLocked ? 
                <Shield size={40} className="drop-shadow-md" /> : 
                <ShieldCheck size={40} className="drop-shadow-md" />
              }
            </motion.div>
          </div>
          
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <motion.p 
              className="text-xl font-medium mb-2 dark:text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {isLocked ? 
                (keyName ? `${t('locking')} ${keyName}...` : t('locking')) : 
                (keyName ? `${t('unlocking')} ${keyName}...` : t('unlocking'))}
            </motion.p>
            <motion.p 
              className="text-axiv-gray dark:text-gray-300 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {isLocked ? t('securingDevice') : t('accessGranted')}
            </motion.p>
          </motion.div>
          
          {/* Progress indicator */}
          <motion.div
            className="mt-8 w-40 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            <motion.div 
              className={cn(
                "h-full rounded-full",
                isLocked ? "bg-axiv-blue" : "bg-green-500"
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
