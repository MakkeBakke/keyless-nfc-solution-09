
import React from 'react';
import { Trash } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { KeyPermission, updateKeyPermission, removeKeyPermission } from '@/utils/permissionUtils';
import { toast } from '@/hooks/use-toast';

interface PermissionItemProps {
  permission: KeyPermission;
  onUpdate: (updatedPermission: KeyPermission) => void;
  onRemove: (permissionId: string) => void;
}

const PermissionItem = ({ permission, onUpdate, onRemove }: PermissionItemProps) => {
  const { t } = useLanguage();

  const handleUpdatePermission = async (field: keyof KeyPermission, value: boolean) => {
    try {
      await updateKeyPermission(permission.id, { [field]: value });
      
      // Update the permission in the parent component
      onUpdate({ ...permission, [field]: value });
      
      toast({
        title: t('permissionUpdated'),
        description: t('userPermissionsHaveBeenUpdated'),
      });
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: t('error'),
        description: t('failedToUpdatePermission'),
        variant: "destructive",
      });
    }
  };
  
  const handleRemovePermission = async () => {
    try {
      await removeKeyPermission(permission.id);
      
      // Remove the permission from the parent component
      onRemove(permission.id);
      
      toast({
        title: t('accessRemoved'),
        description: t('userAccessRemoved'),
      });
    } catch (error) {
      console.error('Error removing permission:', error);
      toast({
        title: t('error'),
        description: t('failedToRemoveAccess'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium dark:text-white">{permission.user_name}</h3>
          <p className="text-sm text-axiv-gray dark:text-gray-400">{permission.user_email}</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRemovePermission}
          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 h-8 w-8"
        >
          <Trash size={16} />
        </Button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm dark:text-gray-300">{t('canUnlock')}</p>
          <Switch 
            checked={permission.can_unlock}
            onCheckedChange={(checked) => handleUpdatePermission('can_unlock', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm dark:text-gray-300">{t('canLock')}</p>
          <Switch 
            checked={permission.can_lock}
            onCheckedChange={(checked) => handleUpdatePermission('can_lock', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm dark:text-gray-300">{t('canViewHistory')}</p>
          <Switch 
            checked={permission.can_view_history}
            onCheckedChange={(checked) => handleUpdatePermission('can_view_history', checked)}
          />
        </div>
      </div>
    </div>
  );
};

export default PermissionItem;
