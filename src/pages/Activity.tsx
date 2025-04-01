
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ActivityItem, { ActivityData } from '@/components/ActivityItem';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const Activity = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/');
        return;
      }

      // Fetch real activity data from Supabase with key information
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('key_activity')
          .select(`
            id,
            action,
            performed_at,
            key_id,
            keys (
              id,
              name
            )
          `)
          .eq('user_id', session.user.id)
          .order('performed_at', { ascending: false });
        
        if (error) {
          throw error;
        }

        // Transform data to match ActivityData structure with proper action type handling
        const formattedActivities = data.map(item => {
          // Map database action to one of the allowed action types
          let actionType: 'unlock' | 'lock' | 'pair' | 'edit';
          
          // Normalize the action to ensure it fits the expected union type
          switch (item.action.toLowerCase()) {
            case 'unlock':
              actionType = 'unlock';
              break;
            case 'lock':
              actionType = 'lock';
              break;
            case 'pair':
              actionType = 'pair';
              break;
            case 'edit':
            case 'update':
            case 'create':
              actionType = 'edit';
              break;
            default:
              // For any other action, default to 'edit' as a fallback
              console.log(`Unknown action type: ${item.action}, defaulting to 'edit'`);
              actionType = 'edit';
          }
          
          return {
            id: item.id,
            keyName: item.keys?.name || t('unknownKey'),
            action: actionType,
            timestamp: new Date(item.performed_at),
            success: true // Assuming all recorded activities were successful
          };
        });

        setActivities(formattedActivities);
      } catch (error) {
        console.error('Error fetching activity:', error);
        toast({
          title: t('error'),
          description: t('failedToLoadActivity'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, t]);
  
  // Group activities by date
  const groupedActivities = activities.reduce<Record<string, ActivityData[]>>((groups, activity) => {
    const date = format(new Date(activity.timestamp), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});
  
  const dateGroups = Object.keys(groupedActivities).sort().reverse();
  
  const getDateHeading = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
      return t('today');
    } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return t('yesterday');
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };
  
  return (
    <div className="min-h-screen pb-24 pt-24 px-4">
      <Header title={t('activity')} showBackButton />
      
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-medium">{t('recentActivity')}</h2>
          <p className="text-axiv-gray text-sm">{t('viewKeyUsage')}</p>
        </div>
        
        <div className="glass-card p-4 animate-fade-in">
          {loading ? (
            <div className="py-8 text-center">
              <p className="text-axiv-gray">{t('loadingActivity')}</p>
            </div>
          ) : dateGroups.length > 0 ? (
            dateGroups.map((dateGroup) => (
              <div key={dateGroup} className="mb-4">
                <h3 className="text-sm font-medium text-axiv-gray mb-2 px-2">
                  {getDateHeading(dateGroup)}
                </h3>
                <div>
                  {groupedActivities[dateGroup].map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-axiv-gray">{t('noActivity')}</p>
              <button 
                onClick={() => navigate('/')}
                className="mt-4 px-4 py-2 bg-axiv-blue text-white rounded-lg"
              >
                {t('addKey')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activity;
