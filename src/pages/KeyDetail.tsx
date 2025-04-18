import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Key, Calendar, Battery, Share2, Settings, BellRing, 
  AlertTriangle, Trash2, ChevronRight, Nfc, Unlock
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Header from '@/components/Header';
import UnlockAnimation from '@/components/UnlockAnimation';
import ActivityItem from '@/components/ActivityItem';
import { toast } from '@/hooks/use-toast';
import { supabase, KeyRecord } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNFC } from '@/hooks/useNFC';
import { usePinSecurity } from '@/contexts/PinSecurityContext';
import PinVerificationDialog from '@/components/PinVerificationDialog';

interface KeyActivityRecord {
  id: string;
  key_id: string;
  user_id: string;
  action: string;
  performed_at: string;
}

const KeyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { 
    isSupported, 
    error: nfcError, 
    emulateNFC, 
    emulationResult, 
    isEmulating 
  } = useNFC();
  const { requireVerification } = usePinSecurity();
  
  const [keyData, setKeyData] = useState<KeyRecord | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<KeyActivityRecord[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isNfcEmulating, setIsNfcEmulating] = useState(false);
  const [nfcErrorMessage, setNfcErrorMessage] = useState<string | null>(null);
  const [unlockAttemptFailed, setUnlockAttemptFailed] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  
  useEffect(() => {
    const fetchKeyData = async () => {
      try {
        if (!id) return;
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          const demoKey: KeyRecord = {
            id: id,
            name: 'Demo Key',
            type: 'Smart Lock',
            battery_level: 75,
            is_active: true,
            is_locked: true,
            last_used: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: 'demo',
            nfc_device_id: 'demo-nfc-id',
            nfc_data: 'demo-nfc-data'
          };
          
          setKeyData(demoKey);
          setLoading(false);
          
          setActivities([
            {
              id: '1',
              key_id: id,
              user_id: 'demo',
              action: 'unlock',
              performed_at: new Date(Date.now() - 3600000).toISOString()
            },
            {
              id: '2',
              key_id: id,
              user_id: 'demo',
              action: 'lock',
              performed_at: new Date(Date.now() - 7200000).toISOString()
            }
          ]);
          
          return;
        }
        
        const { data: keyData, error: keyError } = await supabase
          .from('keys')
          .select('*')
          .eq('id', id)
          .single();
        
        if (keyError) {
          throw keyError;
        }
        
        console.log("Fetched key data:", keyData);
        console.log("NFC data stored in database:", keyData.nfc_data);
        setKeyData(keyData as KeyRecord);
        
        const { data: activityData, error: activityError } = await supabase
          .from('key_activity')
          .select('*')
          .eq('key_id', id)
          .order('performed_at', { ascending: false })
          .limit(10);
        
        if (activityError) {
          throw activityError;
        }
        
        setActivities(activityData as KeyActivityRecord[]);
      } catch (error) {
        console.error('Error fetching key details:', error);
        toast({
          title: t('error'),
          description: t('failedToLoadKeyDetails'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchKeyData();
  }, [id, t]);

  const handleEmulateNfc = async () => {
    if (!keyData) return;
    
    if (!isSupported) {
      toast({
        title: t('error'),
        description: "NFC is not supported on this device. Please use a device with NFC capabilities.",
        variant: "destructive",
      });
      return;
    }

    setShowAnimation(true);
    setIsNfcEmulating(true);
    setNfcErrorMessage(null);
    setUnlockAttemptFailed(false);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log("Emulating NFC with stored data:", keyData.nfc_data);
      const result = await emulateNFC(keyData.id, keyData.nfc_data || undefined);
      
      if (!result.success) {
        setUnlockAttemptFailed(true);
        setNfcErrorMessage(result.message);
        
        toast({
          title: t('unlockFailed'),
          description: result.message,
          variant: "destructive",
        });
        
        return;
      }
      
      console.log("NFC emulation result:", result);
      
      if (session) {
        const { error: updateError } = await supabase
          .from('keys')
          .update({ 
            last_used: new Date().toISOString(),
            is_locked: !keyData.is_locked
          })
          .eq('id', keyData.id);
          
        if (updateError) throw updateError;
        
        await supabase
          .from('key_activity')
          .insert({
            key_id: keyData.id,
            user_id: session.user.id,
            action: keyData.is_locked ? 'unlock' : 'lock'
          });
      }

      if (keyData) {
        setKeyData({
          ...keyData,
          last_used: new Date().toISOString(),
          is_locked: !keyData.is_locked
        });
      }
      
      toast({
        title: keyData.is_locked ? t('keyUnlocked') : t('keyLocked'),
        description: keyData.is_locked ? t('successfullyUnlocked') : t('successfullyLocked'),
      });
      
      const newActivity = {
        id: Date.now().toString(),
        key_id: keyData.id,
        user_id: session?.user.id || 'demo',
        action: keyData.is_locked ? 'unlock' : 'lock',
        performed_at: new Date().toISOString()
      };
      
      setActivities([newActivity, ...activities]);
    } catch (error) {
      console.error('Error emulating NFC:', error);
      setNfcErrorMessage((error as Error).message);
      setUnlockAttemptFailed(true);
      
      toast({
        title: t('error'),
        description: t('failedToUpdateKeyState'),
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setShowAnimation(false);
        setIsNfcEmulating(false);
      }, 1000);
    }
  };
  
  const initiateDeleteKey = () => {
    setShowDeleteDialog(true);
  };
  
  const confirmDeleteKey = () => {
    setShowDeleteDialog(false);
    setDeletePending(true);
    requireVerification();
    setShowPinDialog(true);
  };
  
  const handleDeleteKey = async () => {
    if (!keyData) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { error: deleteError } = await supabase
          .from('keys')
          .delete()
          .eq('id', keyData.id);
          
        if (deleteError) throw deleteError;
      }
      
      toast({
        title: t('keyDeleted'),
        description: t('keyRemoved').replace('{keyName}', keyData.name),
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error deleting key:', error);
      toast({
        title: t('error'),
        description: t('failedToDeleteKey'),
        variant: "destructive",
      });
    } finally {
      setDeletePending(false);
    }
  };

  const handlePinDialogClose = () => {
    setShowPinDialog(false);
    setDeletePending(false);
  };

  const handlePinVerificationSuccess = () => {
    if (deletePending) {
      handleDeleteKey();
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-axiv-light-gray rounded-full mb-4"></div>
          <div className="h-4 bg-axiv-light-gray rounded w-32 mb-2"></div>
          <div className="h-3 bg-axiv-light-gray rounded w-24"></div>
        </div>
      </div>
    );
  }
  
  if (!keyData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <div>
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-medium mb-2">{t('unknownKey')}</h2>
          <p className="text-axiv-gray mb-6">{t('failedToLoadKeyDetails')}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-axiv-blue text-white rounded-lg hover:bg-axiv-blue/90 transition-colors"
          >
            {t('back')}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="min-h-screen pb-24 pt-24 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Header title={keyData?.name || ''} showBackButton />
      
      <div className="max-w-md mx-auto">
        <div className="glass-card p-6 relative overflow-hidden">
          {showAnimation && 
            <UnlockAnimation 
              keyName={keyData.name} 
              isNfcEmulation={isNfcEmulating}
              failed={unlockAttemptFailed}
            />
          }
          
          <div className="flex flex-col items-center justify-center mb-6 relative z-0">
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mb-4",
              keyData.is_active ? "bg-axiv-blue/10" : "bg-axiv-gray/10"
            )}>
              <Key 
                className={cn(
                  "w-10 h-10",
                  keyData.is_active ? "text-axiv-blue" : "text-axiv-gray"
                )} 
              />
            </div>
            <h2 className="text-2xl font-medium mb-1">{keyData.name}</h2>
            <p className="text-axiv-gray">{keyData.type}</p>
            
            <div className="mt-8 w-full max-w-xs flex flex-col items-center">
              <div className="text-center mb-2">
                <p className="text-sm text-axiv-gray">{t('placePhoneNearReader')}</p>
              </div>
              
              <button
                onClick={handleEmulateNfc}
                disabled={isNfcEmulating}
                className="w-40 h-40 rounded-full bg-gradient-to-br from-axiv-blue to-axiv-blue/80 text-white flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 rounded-full scale-[0.97] opacity-0 hover:opacity-100 transition-opacity"></div>
                <Nfc className="w-12 h-12 mb-3" />
                <span className="text-lg font-medium">{t('tapToUnlock')}</span>
              </button>
              
              {nfcErrorMessage && (
                <p className="text-red-500 text-xs mt-4 text-center">{nfcErrorMessage}</p>
              )}
              
              {!isSupported && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-700 text-sm text-center">
                    <span className="font-medium">{t('nfcNotSupported')}:</span> {t('useDeviceWithNFC')}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-axiv-light-gray pt-4 mt-4">
            <h3 className="font-medium mb-3">{t('keyInformation')}</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-axiv-gray">{t('status')}</span>
                <span className={cn(
                  "text-sm px-2 py-1 rounded-full",
                  keyData.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                )}>
                  {keyData.is_active ? t('active') : t('inactive')}
                </span>
              </div>
              
              {keyData.battery_level !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-axiv-gray">{t('batteryLevel')}</span>
                  <div className="flex items-center">
                    <Battery className="w-4 h-4 mr-1.5 text-axiv-gray" />
                    <span className="text-sm">{keyData.battery_level}%</span>
                  </div>
                </div>
              )}
              
              {keyData.last_used && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-axiv-gray">{t('lastUsed')}</span>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5 text-axiv-gray" />
                    <span className="text-sm">
                      {format(new Date(keyData.last_used), 'PPp')}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-axiv-gray">{t('pairedOn')}</span>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5 text-axiv-gray" />
                  <span className="text-sm">
                    {format(new Date(keyData.created_at), 'PP')}
                  </span>
                </div>
              </div>
              
              {keyData.nfc_device_id && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-axiv-gray">NFC ID</span>
                  <div className="flex items-center">
                    <Nfc className="w-4 h-4 mr-1.5 text-axiv-gray" />
                    <span className="text-sm">
                      {keyData.nfc_device_id.substring(0, 8)}...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div 
            className="glass-card p-4 flex items-center justify-between cursor-pointer"
            onClick={() => navigate(`/key/${keyData.id}/permissions`)}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-axiv-blue/10 flex items-center justify-center mr-3">
                <Share2 className="w-5 h-5 text-axiv-blue" />
              </div>
              <span>{t('permissions')}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-axiv-gray" />
          </div>
          
          <div 
            className="glass-card p-4 flex items-center justify-between cursor-pointer"
            onClick={() => navigate(`/key/${keyData.id}/security`)}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-axiv-blue/10 flex items-center justify-center mr-3">
                <Settings className="w-5 h-5 text-axiv-blue" />
              </div>
              <div>
                <span>{t('securitySettings')}</span>
                <p className="text-xs text-axiv-gray">{t('manageSecuritySettings')}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-axiv-gray" />
          </div>
          
          <div 
            className="glass-card p-4 flex items-center justify-between cursor-pointer"
            onClick={() => navigate(`/key/${keyData.id}/notifications`)}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-axiv-blue/10 flex items-center justify-center mr-3">
                <BellRing className="w-5 h-5 text-axiv-blue" />
              </div>
              <div>
                <span>{t('notifications')}</span>
                <p className="text-xs text-axiv-gray">{t('configureNotifications')}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-axiv-gray" />
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">{t('recentActivity')}</h3>
            <button 
              onClick={() => navigate(`/activity?keyId=${keyData.id}`)}
              className="text-axiv-blue text-sm hover:underline"
            >
              {t('viewHistory')}
            </button>
          </div>
          
          {activities.length === 0 ? (
            <div className="text-center text-axiv-gray py-4">
              {t('noActivity')}
            </div>
          ) : (
            <div className="glass-card divide-y divide-axiv-light-gray">
              {activities.slice(0, 5).map((activity) => (
                <ActivityItem 
                  key={activity.id}
                  activity={{
                    id: activity.id,
                    keyName: keyData.name,
                    action: activity.action,
                    timestamp: activity.performed_at,
                    success: true
                  }}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-8">
          <button 
            onClick={initiateDeleteKey}
            className="flex items-center justify-center space-x-2 text-red-500 hover:text-red-600 transition-colors w-full py-3"
          >
            <Trash2 className="w-5 h-5" />
            <span>{t('deleteKey')}</span>
          </button>
        </div>
      </div>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteKey')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteKey')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteKey}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <PinVerificationDialog 
        isOpen={showPinDialog}
        onClose={handlePinDialogClose}
        onSuccess={handlePinVerificationSuccess}
        title={t('securityVerification')}
        description={t('enterPinToDeleteKey')}
      />
    </motion.div>
  );
};

export default KeyDetail;
