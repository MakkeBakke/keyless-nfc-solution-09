
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, Clock, Battery, BatteryCharging } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export interface KeyData {
  id: string;
  name: string;
  type: string;
  lastUsed?: string;
  isActive: boolean;
  batteryLevel?: number;
  isLocked?: boolean;
}

interface KeyCardProps {
  keyData: KeyData;
}

const KeyCard = ({ keyData }: KeyCardProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  const handleCardClick = () => {
    navigate(`/key/${keyData.id}`);
  };
  
  const getBatteryColor = (level?: number) => {
    if (!level) return "bg-gray-300 dark:bg-gray-600";
    if (level < 20) return "bg-red-500";
    if (level < 50) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  const getBatteryIcon = (level?: number) => {
    if (!level) return <Battery size={14} />;
    if (level < 20) return <Battery size={14} className="text-red-500" />;
    return <BatteryCharging size={14} />;
  };
  
  return (
    <motion.div 
      className={cn(
        "glass-card p-5 cursor-pointer transition-all duration-300",
        "hover:shadow-md active:scale-[0.98] mb-4 relative overflow-hidden",
        isDark ? "bg-gray-800 border-gray-700" : ""
      )}
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between relative z-0">
        <div className="flex items-center space-x-4">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            keyData.isActive 
              ? "bg-axiv-blue/10 dark:bg-axiv-blue/20" 
              : "bg-axiv-gray/10 dark:bg-gray-700"
          )}>
            <Key 
              className={cn(
                "w-6 h-6",
                keyData.isActive 
                  ? "text-axiv-blue" 
                  : "text-axiv-gray dark:text-gray-400"
              )} 
            />
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-0.5 dark:text-white">{keyData.name}</h3>
            <p className="text-axiv-gray dark:text-gray-400 text-sm">{keyData.type}</p>
            {keyData.lastUsed && (
              <div className="flex items-center mt-1.5 text-xs text-axiv-gray dark:text-gray-500">
                <Clock size={12} className="mr-1" />
                <span>{t('lastUsed')}: {keyData.lastUsed}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-3">
          {keyData.batteryLevel !== undefined && (
            <div className="flex items-center">
              {getBatteryIcon(keyData.batteryLevel)}
              <div className="w-10 h-2 border border-gray-300 dark:border-gray-600 rounded-full overflow-hidden mx-1">
                <div 
                  className={cn("h-full", getBatteryColor(keyData.batteryLevel))} 
                  style={{ width: `${keyData.batteryLevel}%` }}
                ></div>
              </div>
              <span className="text-xs text-axiv-gray dark:text-gray-400">{keyData.batteryLevel}%</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default KeyCard;
