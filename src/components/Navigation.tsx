
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Activity, Bell, UserCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
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
      <div className="max-w-md mx-auto flex items-center justify-between px-6">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center py-3 px-4 relative",
                "transition-colors",
                isActive ? "text-axiv-blue" : "text-axiv-gray hover:text-axiv-dark"
              )}
            >
              <item.icon size={20} className={isActive ? "text-axiv-blue" : "text-current"} />
              <span className="text-xs mt-1">{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-0 left-1/2 w-12 h-0.5 bg-axiv-blue -translate-x-1/2" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
