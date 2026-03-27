import { useState, useEffect } from 'react';
import type { AdminSetting } from '@/types';
import { Save, Key, DollarSign, Wallet, Globe, Shield, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';

interface AdminSettingsProps {
  settings: AdminSetting[];
  onUpdate: (key: string, value: string) => void;
}

export default function AdminSettings({ settings, onUpdate }: AdminSettingsProps) {
  const { showToast } = useToast();
  const { admin, updateAdminCredentials } = useAuth();
  const [formData, setFormData] = useState<Record<string, string>>({});
  
  // Admin credentials form
  const [credForm, setCredForm] = useState({
    currentPassword: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);

  useEffect(() => {
    const initialData: Record<string, string> = {};
    settings.forEach(s => {
      initialData[s.key] = s.value;
    });
    setFormData(initialData);
  }, [settings]);

  const handleSave = (key: string) => {
    onUpdate(key, formData[key] || '');
  };

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleUpdateCredentials = async () => {
    // Validation
    if (!credForm.currentPassword) {
      showToast('Please enter your current password', 'error');
      return;
    }
    
    if (credForm.newPassword && credForm.newPassword !== credForm.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    
    if (credForm.newPassword && credForm.newPassword.length < 8) {
      showToast('New password must be at least 8 characters', 'error');
      return;
    }

    setIsUpdatingCreds(true);
    
    const success = await updateAdminCredentials(
      credForm.currentPassword,
      credForm.newUsername || undefined,
      credForm.newPassword || undefined
    );
    
    setIsUpdatingCreds(false);
    
    if (success) {
      showToast('Admin credentials updated successfully!', 'success');
      setCredForm({
        currentPassword: '',
        newUsername: '',
        newPassword: '',
        confirmPassword: '',
      });
    } else {
      showToast('Failed to update credentials. Check your current password.', 'error');
    }
  };

  const settingGroups = [
    {
      title: 'Platform Settings',
      icon: Globe,
      settings: [
        { key: 'platform_name', label: 'Platform Name', type: 'text' },
      ],
    },
    {
      title: 'Deposit Addresses',
      icon: Wallet,
      settings: [
        { key: 'deposit_address_btc', label: 'Bitcoin (BTC)', type: 'text' },
        { key: 'deposit_address_eth', label: 'Ethereum (ETH)', type: 'text' },
      ],
    },
    {
      title: 'Withdrawal Fees',
      icon: DollarSign,
      settings: [
        { key: 'withdrawal_fee_btc', label: 'Bitcoin Fee', type: 'number' },
        { key: 'withdrawal_fee_eth', label: 'Ethereum Fee', type: 'number' },
      ],
    },
    {
      title: 'Minimum Withdrawals',
      icon: Key,
      settings: [
        { key: 'min_withdrawal_btc', label: 'Min Bitcoin', type: 'number' },
        { key: 'min_withdrawal_eth', label: 'Min Ethereum', type: 'number' },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Platform Settings</h2>
        <p className="text-[#A5ACBA]">Configure global platform parameters</p>
      </div>

      {/* Admin Credentials Section */}
      <div className="glass-card p-6 border-[#6941C6]/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#6941C6]/20 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-[#6941C6]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Admin Credentials</h3>
            <p className="text-sm text-[#A5ACBA]">Update your administrator login details</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-[#A5ACBA] mb-2">Current Username</label>
            <input
              type="text"
              value={admin?.username || ''}
              disabled
              className="input-dark opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm text-[#A5ACBA] mb-2">Last Login</label>
            <input
              type="text"
              value={admin?.last_login ? new Date(admin.last_login).toLocaleString() : 'Never'}
              disabled
              className="input-dark opacity-50"
            />
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 mt-4">
          <h4 className="text-sm font-medium mb-4 text-[#F79009]">Change Credentials</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#A5ACBA] mb-2">Current Password *</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={credForm.currentPassword}
                  onChange={(e) => setCredForm({ ...credForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="input-dark pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#667085] hover:text-white"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#A5ACBA] mb-2">New Username (optional)</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
                <input
                  type="text"
                  value={credForm.newUsername}
                  onChange={(e) => setCredForm({ ...credForm, newUsername: e.target.value })}
                  placeholder="Leave blank to keep current"
                  className="input-dark pl-12"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#A5ACBA] mb-2">New Password (optional)</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={credForm.newPassword}
                    onChange={(e) => setCredForm({ ...credForm, newPassword: e.target.value })}
                    placeholder="Min 8 characters"
                    className="input-dark pl-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#667085] hover:text-white"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#A5ACBA] mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={credForm.confirmPassword}
                    onChange={(e) => setCredForm({ ...credForm, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    className="input-dark pl-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#667085] hover:text-white"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleUpdateCredentials}
              disabled={isUpdatingCreds}
              className="btn-primary w-full md:w-auto"
            >
              {isUpdatingCreds ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Update Credentials
            </button>
          </div>
        </div>
      </div>

      {/* Settings Groups */}
      <div className="grid lg:grid-cols-2 gap-6">
        {settingGroups.map((group, i) => {
          const Icon = group.icon;
          return (
            <div key={i} className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#6941C6]/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#6941C6]" />
                </div>
                <h3 className="text-lg font-semibold">{group.title}</h3>
              </div>

              <div className="space-y-4">
                {group.settings.map((setting) => (
                  <div key={setting.key}>
                    <label className="block text-sm text-[#A5ACBA] mb-2">{setting.label}</label>
                    <div className="flex gap-2">
                      <input
                        type={setting.type}
                        value={formData[setting.key] || ''}
                        onChange={(e) => handleChange(setting.key, e.target.value)}
                        className="input-dark flex-1"
                      />
                      <button
                        onClick={() => handleSave(setting.key)}
                        className="px-4 py-2 bg-[#6941C6] rounded-lg hover:bg-[#6941C6]/90 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#F04438]/20 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#F04438]" />
          </div>
          <h3 className="text-lg font-semibold">Security</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#070B13] rounded-lg">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-[#A5ACBA]">Require 2FA for admin access</p>
            </div>
            <button 
              onClick={() => showToast('2FA settings coming soon!', 'info')}
              className="btn-outline text-sm py-2 px-4"
            >
              Configure
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#070B13] rounded-lg">
            <div>
              <p className="font-medium">API Keys</p>
              <p className="text-sm text-[#A5ACBA]">Manage external API integrations</p>
            </div>
            <button 
              onClick={() => showToast('API settings coming soon!', 'info')}
              className="btn-outline text-sm py-2 px-4"
            >
              Manage
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#070B13] rounded-lg">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-[#A5ACBA]">Configure email alerts for transactions</p>
            </div>
            <button 
              onClick={() => showToast('Email settings coming soon!', 'info')}
              className="btn-outline text-sm py-2 px-4"
            >
              Configure
            </button>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">System Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[#070B13] rounded-lg text-center">
            <p className="text-xs text-[#A5ACBA] mb-1">Version</p>
            <p className="font-medium">1.0.0</p>
          </div>
          <div className="p-4 bg-[#070B13] rounded-lg text-center">
            <p className="text-xs text-[#A5ACBA] mb-1">Environment</p>
            <p className="font-medium">Production</p>
          </div>
          <div className="p-4 bg-[#070B13] rounded-lg text-center">
            <p className="text-xs text-[#A5ACBA] mb-1">Database</p>
            <p className="font-medium text-[#17B26A]">Connected</p>
          </div>
          <div className="p-4 bg-[#070B13] rounded-lg text-center">
            <p className="text-xs text-[#A5ACBA] mb-1">Last Updated</p>
            <p className="font-medium">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
