
import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Activity, Bell, UserCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const navContainerRef = useRef<HTMLDivElement>(null);
  
  const navItems = [
    {
      icon: Home,
      label: t('home'),
      path: '/'
    },
    {
      icon: Activity,
      label: t('activity'),
      path: '/activity'
    },
    {
      icon: Bell,
      label: t('notifications'),
      path: '/notifications'
    },
    {
      icon: UserCircle,
      label: t('profile'),
      path: '/profile'
    },
    {
      icon: Settings,
      label: t('settings'),
      path: '/settings'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-gray-200 z-40">
      <div className="max-w-md relative mx-auto flex justify-center">
        {/* Navigation items container with explicit centering */}
        <div 
          ref={navContainerRef}
          className="flex overflow-x-auto scrollbar-hide scroll-smooth justify-center"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch' // For smoother scrolling on iOS
          }}
        >
          <div className="flex justify-center">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex flex-col items-center py-3 px-4 relative flex-shrink-0",
                    "transition-all duration-200",
                    isActive ? "text-axiv-blue" : "text-axiv-gray hover:text-axiv-dark"
                  )}
                >
                  <item.icon size={20} className={isActive ? "text-axiv-blue" : "text-current"} />
                  <span className="text-xs mt-1">{item.label}</span>
                  {isActive && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: '3rem' }}
                      className="absolute -bottom-0 left-1/2 h-0.5 bg-axiv-blue -translate-x-1/2" 
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
