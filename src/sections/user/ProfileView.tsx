import { useState, useRef } from 'react';
import type { User } from '@/types';
import { useToast } from '@/contexts/ToastContext';
import { mockApi } from '@/lib/mockData';
import { supabase, updateUser } from '@/lib/supabase';
import { User as UserIcon, Mail, Wallet, Save, Camera } from 'lucide-react';

interface ProfileViewProps {
  user: User | null;
  onUpdate: () => void;
}

export default function ProfileView({ user, onUpdate }: ProfileViewProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || null);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    withdrawal_address: user?.withdrawal_address || '',
  });

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) {
      showToast('Please select a file', 'error');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const timestamp = Date.now();
      const filename = `${user.id}/${timestamp}-${file.name.replace(/\s+/g, '-')}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filename, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filename);

      const newAvatarUrl = publicUrlData.publicUrl;
      setAvatarUrl(newAvatarUrl);

      // Update user profile
      await updateUser(user.id, { avatar_url: newAvatarUrl });
      showToast('Profile picture updated successfully!', 'success');
      onUpdate();
    } catch (error) {
      console.error('Avatar upload error:', error);
      showToast('Failed to upload profile picture', 'error');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      await mockApi.updateUser(user.id, {
        full_name: formData.full_name,
        withdrawal_address: formData.withdrawal_address,
      });
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      showToast('Failed to update profile', 'error');
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="glass-card p-6 text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user?.full_name || 'Profile'}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-[#6938ef] to-[#d534d8] rounded-full flex items-center justify-center text-3xl font-bold">
              {getInitials(user?.full_name || null)}
            </div>
          )}
          {isEditing && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploadingAvatar}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 p-2 bg-[#6941C6] rounded-full hover:bg-[#5A35B1] disabled:opacity-50 transition-colors"
                title="Upload profile picture"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </>
          )}
        </div>
        <h2 className="text-2xl font-bold">{user?.full_name || 'User'}</h2>
        <p className="text-[#A5ACBA]">{user?.email}</p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-[#6941C6]/20 text-[#6941C6] rounded-full text-sm">
          <span className="w-2 h-2 bg-[#6941C6] rounded-full" />
          Pro Member
        </div>
      </div>

      {/* Profile Form */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Profile Information</h3>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={isEditing ? 'btn-primary text-sm py-2 px-4' : 'btn-outline text-sm py-2 px-4'}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            ) : (
              'Edit Profile'
            )}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#A5ACBA] mb-2">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                disabled={!isEditing}
                className="input-dark pl-12 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#A5ACBA] mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
              <input
                type="email"
                value={formData.email}
                disabled
                className="input-dark pl-12 opacity-50"
              />
            </div>
            <p className="text-xs text-[#667085] mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm text-[#A5ACBA] mb-2">Default Withdrawal Address</label>
            <div className="relative">
              <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
              <input
                type="text"
                value={formData.withdrawal_address}
                onChange={(e) => setFormData({ ...formData, withdrawal_address: e.target.value })}
                disabled={!isEditing}
                placeholder="Enter your crypto wallet address"
                className="input-dark pl-12 disabled:opacity-50"
              />
            </div>
            <p className="text-xs text-[#667085] mt-1">This address will be used for withdrawals by default</p>
          </div>
        </div>
      </div>

      {/* Account Stats */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Account Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#070B13] rounded-lg">
            <p className="text-xs text-[#A5ACBA] mb-1">Account Balance</p>
            <p className="text-xl font-bold">${(user?.balance || 0).toLocaleString()}</p>
          </div>
          <div className="p-4 bg-[#070B13] rounded-lg">
            <p className="text-xs text-[#A5ACBA] mb-1">Total Profit/Loss</p>
            <p className={`text-xl font-bold ${(user?.profit_loss || 0) >= 0 ? 'text-[#17B26A]' : 'text-[#F04438]'}`}>
              {(user?.profit_loss || 0) >= 0 ? '+' : ''}${(user?.profit_loss || 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-[#070B13] rounded-lg">
            <p className="text-xs text-[#A5ACBA] mb-1">Member Since</p>
            <p className="text-lg font-medium">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="p-4 bg-[#070B13] rounded-lg">
            <p className="text-xs text-[#A5ACBA] mb-1">Account Status</p>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${user?.status === 'active' ? 'bg-[#17B26A]' : 'bg-[#F04438]'}`} />
              <span className="text-lg font-medium capitalize">{user?.status || 'Unknown'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Security</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#070B13] rounded-lg">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-[#A5ACBA]">Add an extra layer of security</p>
            </div>
            <button 
              onClick={() => showToast('2FA setup coming soon!', 'info')}
              className="btn-outline text-sm py-2 px-4"
            >
              Enable
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#070B13] rounded-lg">
            <div>
              <p className="font-medium">Change Password</p>
              <p className="text-xs text-[#A5ACBA]">Update your account password</p>
            </div>
            <button 
              onClick={() => showToast('Password change coming soon!', 'info')}
              className="btn-outline text-sm py-2 px-4"
            >
              Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
