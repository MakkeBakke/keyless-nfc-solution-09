
import React, { useState, useEffect } from 'react';
import { Plus, Nfc, RefreshCw, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import KeyCard, { KeyData } from '@/components/KeyCard';
import AddKeyModal from '@/components/AddKeyModal';
import WelcomeGuide from '@/components/WelcomeGuide';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

// Type definition to match the Supabase database structure
interface KeyRecord {
  id: string;
  name: string;
  type: string;
  battery_level?: number;
  is_active: boolean;
  last_used?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_locked: boolean;
}

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [keys, setKeys] = useState<KeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  
  // Check if it's the user's first visit
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('axiv_visited');
    if (!hasVisitedBefore) {
      setShowGuide(true);
      localStorage.setItem('axiv_visited', 'true');
    }
  }, []);
  
  useEffect(() => {
    // Check if user is authenticated
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // User is not authenticated, show demo data
        setKeys([
          {
            id: '1',
            name: 'Front Door (Demo Key 1)',
            type: 'Smart Lock',
            lastUsed: '2 hours ago',
            isActive: true,
            batteryLevel: 85,
            isLocked: true
          },
          {
            id: '2',
            name: 'Office (Demo Key 2)',
            type: 'Smart Lock',
            lastUsed: 'Yesterday',
            isActive: true,
            batteryLevel: 42,
            isLocked: false
          }
        ]);
        setLoading(false);
        return;
      }
      
      setUserId(session.user.id);
      
      // Fetch user's keys from database
      try {
        const { data, error } = await supabase
          .from('keys')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Format keys for UI
        const formattedKeys = (data as KeyRecord[]).map((key) => ({
          id: key.id,
          name: key.name,
          type: key.type,
          lastUsed: key.last_used ? new Date(key.last_used).toLocaleDateString() : undefined,
          isActive: key.is_active,
          batteryLevel: key.battery_level,
          isLocked: key.is_locked
        }));
        
        setKeys(formattedKeys);
      } catch (error) {
        console.error('Error fetching keys:', error);
        toast({
          title: "Error",
          description: t('failedToLoadKeys'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, [t]);
  
  const handleAddKey = async (keyName: string, keyType: string) => {
    if (!userId) {
      // Redirect to profile for login/signup
      navigate('/profile');
      return;
    }
    
    try {
      // Insert new key into database
      const { data, error } = await supabase
        .from('keys')
        .insert({
          name: keyName,
          type: keyType,
          user_id: userId,
          battery_level: 100,
          is_active: true,
          is_locked: true
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Add to UI
      const newKey: KeyData = {
        id: data.id,
        name: data.name,
        type: data.type,
        isActive: data.is_active,
        batteryLevel: data.battery_level,
        isLocked: data.is_locked
      };
      
      setKeys([newKey, ...keys]);
      
      // Log activity
      await supabase
        .from('key_activity')
        .insert({
          key_id: data.id,
          user_id: userId,
          action: 'create'
        });
      
      toast({
        title: "Key Added",
        description: `${keyName} has been added to your keys`,
      });
    } catch (error) {
      console.error('Error adding key:', error);
      toast({
        title: "Error",
        description: "Failed to add key",
        variant: "destructive",
      });
    }
  };
  
  const handleRefresh = async () => {
    if (!userId) {
      return;
    }
    
    setIsRefreshing(true);
    
    try {
      // Refresh keys from database
      const { data, error } = await supabase
        .from('keys')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Format keys for UI
      const formattedKeys = data.map((key) => ({
        id: key.id,
        name: key.name,
        type: key.type,
        lastUsed: key.last_used ? new Date(key.last_used).toLocaleDateString() : undefined,
        isActive: key.is_active,
        batteryLevel: key.battery_level,
        isLocked: key.is_locked
      }));
      
      setKeys(formattedKeys);
      
      toast({
        title: "Synchronized",
        description: "All keys are up to date",
      });
    } catch (error) {
      console.error('Error refreshing keys:', error);
      toast({
        title: "Error",
        description: "Failed to refresh keys",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <div className="min-h-screen pb-24 pt-24 px-4">
      <Header title={t('yourKeys')} />
      
      <section className="max-w-md mx-auto">
        {showGuide && (
          <WelcomeGuide onClose={() => setShowGuide(false)} />
        )}
      
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-medium">{t('yourKeys')}</h2>
            <p className="text-axiv-gray text-sm">{t('manageKeys')}</p>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={handleRefresh}
              className={cn(
                "w-10 h-10 rounded-full bg-axiv-light-gray text-axiv-gray flex items-center justify-center",
                "hover:bg-gray-200 active:scale-[0.97] transition-all",
                "tooltip-container"
              )}
              aria-label={t('refreshKeys')}
              disabled={isRefreshing}
            >
              <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
              <span className="tooltip">{t('refreshKeys')}</span>
            </button>
            
            <button 
              onClick={() => setShowAddModal(true)}
              className={cn(
                "w-10 h-10 rounded-full bg-axiv-blue text-white flex items-center justify-center",
                "shadow-md hover:bg-axiv-blue/90 active:scale-[0.97] transition-all",
                "tooltip-container"
              )}
              aria-label={t('addNewKey')}
            >
              <Plus size={20} />
              <span className="tooltip">{t('addNewKey')}</span>
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="glass-card p-8 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 bg-axiv-light-gray rounded-full mb-4"></div>
              <div className="h-4 bg-axiv-light-gray rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-axiv-light-gray rounded w-1/2"></div>
            </div>
          </div>
        ) : keys.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-axiv-blue/10 flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-axiv-blue" />
            </div>
            <h3 className="text-lg font-medium mb-2">{t('noKeysAdded')}</h3>
            <p className="text-axiv-gray mb-4">{t('addFirstKey')}</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-axiv-blue text-white rounded-lg hover:bg-axiv-blue/90 transition-colors"
            >
              {t('addKey')}
            </button>
          </div>
        ) : (
          <div className="mb-8">
            {keys.map((key) => (
              <KeyCard key={key.id} keyData={key} />
            ))}
          </div>
        )}
        
        <div className="bg-axiv-blue/5 rounded-2xl p-4 mb-4">
          <h3 className="font-medium mb-2">{t('quickTips')}</h3>
          <ul className="text-sm text-axiv-gray space-y-2">
            <li className="flex items-start">
              <span className="inline-block w-4 h-4 rounded-full bg-axiv-blue/20 text-axiv-blue text-xs flex items-center justify-center mr-2 mt-0.5">1</span>
              {t('tipViewDetails')}
            </li>
            <li className="flex items-start">
              <span className="inline-block w-4 h-4 rounded-full bg-axiv-blue/20 text-axiv-blue text-xs flex items-center justify-center mr-2 mt-0.5">2</span>
              {t('tipLockUnlock')}
            </li>
            <li className="flex items-start">
              <span className="inline-block w-4 h-4 rounded-full bg-axiv-blue/20 text-axiv-blue text-xs flex items-center justify-center mr-2 mt-0.5">3</span>
              {t('tipPairDevice')}
            </li>
          </ul>
        </div>
        
        <div 
          className="glass-card p-4 flex items-center justify-between cursor-pointer animate-fade-in"
          onClick={() => navigate('/pair')}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-axiv-blue/10 flex items-center justify-center mr-3">
              <Nfc className="w-5 h-5 text-axiv-blue" />
            </div>
            <div>
              <h3 className="font-medium">{t('pairNewDevice')}</h3>
              <p className="text-axiv-gray text-sm">{t('connectNFC')}</p>
            </div>
          </div>
          
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </section>
      
      <AddKeyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddKey}
      />
    </div>
  );
};

export default Index;
