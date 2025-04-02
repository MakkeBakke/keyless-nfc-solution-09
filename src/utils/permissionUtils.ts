
import { supabase } from "@/integrations/supabase/client";

// Define the KeyPermission interface
export interface KeyPermission {
  id: string;
  key_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  can_unlock: boolean;
  can_lock: boolean;
  can_view_history: boolean;
}

/**
 * Fetches permissions for a specific key
 */
export const fetchKeyPermissions = async (keyId: string) => {
  const { data, error } = await supabase
    .from('key_permissions')
    .select('*')
    .eq('key_id', keyId);
    
  if (error) {
    console.error('Error fetching permissions:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Adds a new user permission for a key
 */
export const addKeyPermission = async (permission: Omit<KeyPermission, 'id'>) => {
  const { data, error } = await supabase
    .from('key_permissions')
    .insert(permission)
    .select();
    
  if (error) {
    console.error('Error adding permission:', error);
    throw error;
  }
  
  return data?.[0] || null;
};

/**
 * Updates an existing permission
 */
export const updateKeyPermission = async (
  permissionId: string, 
  updates: Partial<Omit<KeyPermission, 'id' | 'key_id' | 'user_id' | 'user_email' | 'user_name'>>
) => {
  const { error } = await supabase
    .from('key_permissions')
    .update(updates)
    .eq('id', permissionId);
    
  if (error) {
    console.error('Error updating permission:', error);
    throw error;
  }
  
  return true;
};

/**
 * Removes a permission for a key
 */
export const removeKeyPermission = async (permissionId: string) => {
  const { error } = await supabase
    .from('key_permissions')
    .delete()
    .eq('id', permissionId);
    
  if (error) {
    console.error('Error removing permission:', error);
    throw error;
  }
  
  return true;
};
