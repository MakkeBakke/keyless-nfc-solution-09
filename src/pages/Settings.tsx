
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, Shield, Smartphone, Moon, Sun, LogOut, Lock } from 'lucide-react';
import Header from '@/components/Header';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePinSecurity } from '@/contexts/PinSecurityContext';
import PinVerificationDialog from '@/components/PinVerificationDialog';

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const { isPinSet, requireVerification } = usePinSecurity();
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        const { data } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', session.user.id)
          .single();
          
        if (data) {
          setUser(prev => ({
            ...prev,
            name: data.name || 'User Name',
            email: data.email || prev.email
          }));
        }
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          setTimeout(() => {
            checkAuth();
          }, 0);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const withPinVerification = (action: () => void) => {
    setPendingAction(() => action);
    requireVerification();
    setShowPinDialog(true);
  };
  
  const handleLogout = async () => {
    withPinVerification(async () => {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: t('error'),
          description: t('error'),
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: t('signOut'),
        description: t('signOut'),
      });
      navigate('/profile');
    });
  };

  const handlePinDialogClose = () => {
    setShowPinDialog(false);
    setPendingAction(null);
  };

  const handlePinVerificationSuccess = () => {
    if (pendingAction) {
      pendingAction();
    }
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
    toast({
      title: checked ? t('darkMode') : t('darkMode'),
      description: checked ? t('darkMode') : t('darkMode'),
    });
  };

  const handleNotificationsToggle = (checked: boolean) => {
    setNotifications(checked);
    toast({
      title: t('notifications'),
      description: t('notifications'),
    });
  };

  const handleBiometricsToggle = (checked: boolean) => {
    setBiometrics(checked);
    toast({
      title: t('biometricAuth'),
      description: t('biometricAuth'),
    });
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handlePinSettingsClick = () => {
    setShowPinDialog(true);
  };
  
  return (
    <div className="min-h-screen pb-24 pt-24 px-4">
      <Header title={t('settings')} showBackButton />
      
      <div className="max-w-md mx-auto">
        <div className="glass-card p-6 mb-6 animate-fade-in">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-axiv-blue/10 flex items-center justify-center">
              <User className="w-8 h-8 text-axiv-blue" />
            </div>
            <div>
              <h2 className="text-xl font-medium">{user?.name || 'User Name'}</h2>
              <p className="text-axiv-gray text-sm">{user?.email || 'Sign in to access your profile'}</p>
            </div>
          </div>
          
          <button 
            onClick={handleProfileClick}
            className="w-full py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {user ? t('profile') : t('signIn')}
          </button>
        </div>
        
        <div className="glass-card p-6 mb-6 animate-slide-up">
          <h3 className="font-medium mb-4">{t('appSettings')}</h3>
          
          <div className="space-y-4">
            <SettingItem 
              icon={<Lock />}
              title={t('securityPin')}
              description={isPinSet ? t('changePinDesc') : t('setupPinDesc')}
              onClick={handlePinSettingsClick}
            />
            
            <SettingItem 
              icon={<Bell />}
              title={t('notifications')}
              description={t('notificationsDesc')}
              control={
                <Switch 
                  checked={notifications} 
                  onCheckedChange={handleNotificationsToggle} 
                />
              }
            />
            
            <SettingItem 
              icon={<Shield />}
              title={t('biometricAuth')}
              description={t('biometricAuthDesc')}
              control={
                <Switch 
                  checked={biometrics} 
                  onCheckedChange={handleBiometricsToggle} 
                />
              }
            />
            
            <SettingItem 
              icon={theme === 'dark' ? <Moon /> : <Sun />}
              title={t('darkMode')}
              description={t('darkModeDesc')}
              control={
                <Switch 
                  checked={theme === 'dark'} 
                  onCheckedChange={handleDarkModeToggle} 
                />
              }
            />
            
            <SettingItem 
              icon={<Smartphone />}
              title={t('deviceManagement')}
              description={t('deviceManagementDesc')}
              onClick={() => withPinVerification(() => navigate('/pair'))}
            />
            
            <LanguageSelector />
          </div>
        </div>
        
        {user && (
          <div className="glass-card p-6 animate-slide-up">
            <button 
              onClick={handleLogout}
              className="flex items-center text-red-500 hover:text-red-600 transition-colors mx-auto"
            >
              <LogOut size={18} className="mr-2" />
              {t('logout')}
            </button>
          </div>
        )}
      </div>
      
      <PinVerificationDialog 
        isOpen={showPinDialog}
        onClose={handlePinDialogClose}
        onSuccess={handlePinVerificationSuccess}
      />
    </div>
  );
};

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  control?: React.ReactNode;
  onClick?: () => void;
}

const SettingItem = ({ icon, title, description, control, onClick }: SettingItemProps) => (
  <div 
    className={cn(
      "flex items-center justify-between py-3",
      onClick && "cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2"
    )}
    onClick={onClick}
  >
    <div className="flex items-center">
      <div className="w-10 h-10 rounded-full bg-axiv-blue/10 flex items-center justify-center mr-3">
        <span className="text-axiv-blue">{icon}</span>
      </div>
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-axiv-gray text-sm">{description}</p>
      </div>
    </div>
    {control ? (
      <div>{control}</div>
    ) : (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )}
  </div>
);

export default Settings;
