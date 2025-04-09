
import React, { useState } from 'react';
import { Mail, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { addKeyPermission, KeyPermission } from '@/utils/permissionUtils';
import { supabase } from '@/integrations/supabase/client';

interface InviteUserDialogProps {
  keyId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteSuccess: (newPermission: KeyPermission) => void;
}

const InviteUserDialog = ({ keyId, isOpen, onOpenChange, onInviteSuccess }: InviteUserDialogProps) => {
  const { t } = useLanguage();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [canUnlock, setCanUnlock] = useState(true);
  const [canLock, setCanLock] = useState(true);
  const [canViewHistory, setCanViewHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Function to send invitation email
  const sendInvitationEmail = async (receiverEmail: string, userName: string, keyData: any) => {
    try {
      // Create email payload
      const emailPayload = {
        to: receiverEmail,
        subject: `${t('invitationToAccessKey')}: ${keyData?.name || 'Smart Lock'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>${t('youveBeenInvited')}</h2>
            <p>${userName || t('someone')} ${t('hasInvitedYouToAccessKey')} "${keyData?.name || 'Smart Lock'}".</p>
            <p>${t('youCanNowAccess')}:</p>
            <ul>
              ${canUnlock ? `<li>${t('unlockTheKey')}</li>` : ''}
              ${canLock ? `<li>${t('lockTheKey')}</li>` : ''}
              ${canViewHistory ? `<li>${t('viewKeyHistory')}</li>` : ''}
            </ul>
            <p>${t('toGetStarted')}</p>
            <div style="margin: 20px 0;">
              <a href="${window.location.origin}" style="background-color: #2563eb; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
                ${t('openApp')}
              </a>
            </div>
          </div>
        `
      };

      // Send email using Supabase Edge Function or a dedicated email service
      const { error } = await supabase.functions.invoke('send-invitation-email', {
        body: emailPayload
      });

      if (error) {
        console.error('Error sending invitation email:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error sending invitation email:', error);
      return false;
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail || !keyId) return;
    
    setIsSending(true);
    
    try {
      // Fetch key data to include in the email
      const { data: keyData } = await supabase
        .from('keys')
        .select('*')
        .eq('id', keyId)
        .single();
      
      // Create new permission object
      const newPermission = {
        key_id: keyId,
        user_email: inviteEmail,
        user_name: inviteName || inviteEmail.split('@')[0],
        can_unlock: canUnlock,
        can_lock: canLock,
        can_view_history: canViewHistory
      };
      
      // Add permission to database
      const createdPermission = await addKeyPermission(newPermission);
      
      if (createdPermission) {
        // Send invitation email
        const emailSent = await sendInvitationEmail(inviteEmail, inviteName || inviteEmail.split('@')[0], keyData);
        
        toast({
          title: t('invitationSent'),
          description: emailSent 
            ? t('userWillReceiveEmail') 
            : t('permissionsAddedButEmailFailed'),
        });
        
        // Notify parent component
        onInviteSuccess(createdPermission);
        
        // Clear the form
        setInviteEmail('');
        setInviteName('');
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error('Error inviting user:', error);
      
      // Handle case when user already has access
      if (error.message?.includes('duplicate key value')) {
        toast({
          title: t('error'),
          description: t('userAlreadyHasAccess'),
          variant: "destructive",
        });
      } else {
        toast({
          title: t('error'),
          description: t('failedToInviteUser'),
          variant: "destructive",
        });
      }
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setInviteEmail('');
    setInviteName('');
    setCanUnlock(true);
    setCanLock(true);
    setCanViewHistory(false);
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) resetForm();
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-axiv-blue" />
            {t('invitePeople')}
          </DialogTitle>
          <DialogDescription>
            {t('invitePeopleDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-sm">
              Email
              <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center border rounded-md">
              <div className="pl-3">
                <Mail className="h-4 w-4 text-axiv-gray" />
              </div>
              <Input
                id="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@example.com"
                className="border-0 focus-visible:ring-3"
                type="email"
                required
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-sm flex items-center">
              {t('friendOrFamilyName')}
              <span className="text-xs ml-1 text-axiv-gray">{t('optional')}</span>
            </Label>
            <Input
              id="name"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="John Doe"
            />
          </div>
          
          <div className="space-y-3 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="can-unlock" checked={canUnlock} onCheckedChange={(checked) => setCanUnlock(checked === true)} />
              <Label htmlFor="can-unlock" className="text-sm">{t('canUnlock')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="can-lock" checked={canLock} onCheckedChange={(checked) => setCanLock(checked === true)} />
              <Label htmlFor="can-lock" className="text-sm">{t('canLock')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="can-view-history" checked={canViewHistory} onCheckedChange={(checked) => setCanViewHistory(checked === true)} />
              <Label htmlFor="can-view-history" className="text-sm">{t('canViewHistory')}</Label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button 
            disabled={!inviteEmail || isSending} 
            onClick={handleInviteUser} 
            className="bg-axiv-blue hover:bg-axiv-blue/90 text-white"
          >
            {isSending ? t('sending') : t('sendInvite')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserDialog;
