
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Activity, Bell, UserCircle, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const navContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
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

  // Check if we can scroll left or right
  const checkScrollability = () => {
    if (!navContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = navContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5); // 5px buffer
  };

  // Scroll the navbar in the specified direction
  const scroll = (direction: 'left' | 'right') => {
    if (!navContainerRef.current) return;
    
    const scrollAmount = 150;
    const currentScroll = navContainerRef.current.scrollLeft;
    const targetScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;
    
    navContainerRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  // Check scrollability on mount and window resize
  useEffect(() => {
    checkScrollability();
    
    const handleResize = () => {
      checkScrollability();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check scrollability when scrolling the nav container
  useEffect(() => {
    const navContainer = navContainerRef.current;
    if (navContainer) {
      navContainer.addEventListener('scroll', checkScrollability);
      return () => navContainer.removeEventListener('scroll', checkScrollability);
    }
  }, []);
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-gray-200 z-40">
      <div className="max-w-md relative mx-auto">
        {/* Left scroll button */}
        {canScrollLeft && (
          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-10 bg-gradient-to-r from-background/80 to-transparent px-2 flex items-center"
            aria-label="Scroll left"
          >
            <ChevronLeft className="text-axiv-gray" size={20} />
          </motion.button>
        )}
        
        {/* Right scroll button */}
        {canScrollRight && (
          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-10 bg-gradient-to-l from-background/80 to-transparent px-2 flex items-center"
            aria-label="Scroll right"
          >
            <ChevronRight className="text-axiv-gray" size={20} />
          </motion.button>
        )}
        
        {/* Navigation items container */}
        <div 
          ref={navContainerRef}
          className="flex overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center py-3 px-4 relative flex-shrink-0",
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
      </div>
    </nav>
  );
};

export default Navigation;
