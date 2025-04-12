
import React from 'react';
import { Switch } from '@/components/ui/switch';

interface NotificationToggleItemProps {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const NotificationToggleItem = ({
  title,
  description,
  checked,
  onCheckedChange
}: NotificationToggleItemProps) => {
  return (
    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium dark:text-white">{title}</h3>
          <p className="text-sm text-axiv-gray dark:text-gray-400 mt-1">
            {description}
          </p>
        </div>
        <Switch 
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
      </div>
    </div>
  );
};

export default NotificationToggleItem;
