import { useEffect, useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Palette, LogOut, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import db from '@/lib/cocobase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ACCOUNT_DELETE_URL = import.meta.env
  .VITE_ACCOUNT_DELETE_URL as string | undefined;

const Settings = () => {
  const { user, logout, refreshUser } = useAuth();
  const { colorBlindMode, setColorBlindMode, isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar);
  const [savingProfile, setSavingProfile] = useState(false);
  const [memberId, setMemberId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;

      const stored = localStorage.getItem(`hf_profile_${user.id}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.name) setName(parsed.name);
          if (parsed.bio) setBio(parsed.bio);
          if (parsed.avatar) setAvatar(parsed.avatar);
        } catch {
          // ignore
        }
      }

      try {
        const workspaceId =
          (user as any)?.workspaceId ?? (user as any)?.id;
        if (!workspaceId) return;

        let docs: any[] = [];
        try {
          docs = await db.listDocuments('members', {
            filters: { ownerId: workspaceId, authUserId: (user as any)?.id },
            sort: 'created_at',
            order: 'desc',
          });
        } catch (err) {
          console.log('SETTINGS MEMBER LOOKUP BY AUTH ID FAILED', err);
        }

        if (!docs.length && user.email) {
          try {
            docs = await db.listDocuments('members', {
              filters: { ownerId: workspaceId, email: user.email },
              sort: 'created_at',
              order: 'desc',
            });
          } catch (err) {
            console.log('SETTINGS MEMBER LOOKUP BY EMAIL FAILED', err);
          }
        }

        if (!docs.length) return;

        const doc = docs[0] as any;
        const data = doc.data || {};
        setMemberId(doc.id as string);
        if (data.name) setName(data.name);
        if (typeof data.bio === 'string') setBio(data.bio);
        if (data.avatar) setAvatar(data.avatar);
      } catch (err) {
        console.log('SETTINGS LOAD PROFILE ERROR:', err);
      }
    };

    loadProfile();
  }, [user?.id, user?.email]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Please choose an image smaller than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatar(result);
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const workspaceId =
        (user as any)?.workspaceId ?? (user as any)?.id;

      if (workspaceId) {
        if (memberId) {
          try {
            await db.updateDocument('members', memberId, {
              name,
              bio,
              avatar,
            });
          } catch (err) {
            console.log('SETTINGS PROFILE UPDATE ERROR:', err);
            toast.error('Failed to save profile');
            return;
          }
        } else if (user?.id) {
          try {
            const created = await db.createDocument('members', {
              ownerId: workspaceId,
              authUserId: (user as any)?.id,
              email: user.email,
              name,
              bio,
              avatar,
              role: (user as any)?.role || 'Admin',
            });
            setMemberId((created as any).id as string);
          } catch (err) {
            console.log('SETTINGS PROFILE CREATE MEMBER ERROR:', err);
            // fall through – still persist to localStorage and refresh user
          }
        }
      }

      if (user?.id) {
        localStorage.setItem(
          `hf_profile_${user.id}`,
          JSON.stringify({ name, bio, avatar }),
        );
      }

      await refreshUser();

      toast.success('Profile updated successfully!');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (!ACCOUNT_DELETE_URL) {
      toast.error('Account deletion is not configured');
      return;
    }

    const confirmText = window.prompt(
      'Type DELETE to permanently delete your account. This action cannot be undone.',
    );
    if (confirmText !== 'DELETE') {
      toast.info('Account deletion cancelled');
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(ACCOUNT_DELETE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: (user as any)?.id, email: user?.email }),
      });

      const text = await response.text();

      if (!response.ok) {
        console.log('ACCOUNT DELETE ERROR:', response.status, text);
        toast.error('Failed to delete account');
        return;
      }

      toast.success('Account deleted successfully');
      await logout();
      navigate('/');
    } catch (err) {
      console.log('ACCOUNT DELETE NETWORK ERROR:', err);
      toast.error('Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Profile Information</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex items-center space-x-6">
              <Avatar className="w-24 h-24 ring-4 ring-primary/20">
                <AvatarImage src={avatar} />
                <AvatarFallback className="text-2xl">
                  {name?.[0] || user?.name?.[0] || user?.email?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={handleAvatarClick}
                >
                  Change Photo
                </Button>
                <p className="text-sm text-muted-foreground mt-2">JPG, PNG or GIF. Max 5MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" defaultValue={user?.email} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <textarea
                className="w-full p-3 rounded-lg bg-background border border-border resize-none"
                rows={4}
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90"
              disabled={savingProfile}
            >
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Notifications</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Email Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about community activities
                </p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Push Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Get push notifications for important events
                </p>
              </div>
              <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Event Reminders</h3>
                <p className="text-sm text-muted-foreground">
                  Reminder notifications before events start
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Palette className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Appearance</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Dark Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Use dark theme for better viewing at night
                </p>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Color-Blind Friendly Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Accessible color palette for better visibility
                </p>
              </div>
              <select 
                className="p-2 rounded-lg bg-background border border-border text-sm"
                value={colorBlindMode}
                onChange={(e) => setColorBlindMode(e.target.value as any)}
              >
                <option value="normal">Normal</option>
                <option value="deuteranopia">Deuteranopia</option>
                <option value="protanopia">Protanopia</option>
                <option value="tritanopia">Tritanopia</option>
              </select>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Theme Color</h3>
              <div className="flex space-x-3">
                {['cyan', 'indigo', 'purple', 'pink'].map((color) => (
                  <button
                    key={color}
                    className={`w-12 h-12 rounded-lg bg-${color}-500 hover:scale-110 transition-transform ${
                      color === 'cyan' ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Security</h2>
          </div>

          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Connected Accounts
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-card p-6 border-destructive/50">
          <h2 className="text-2xl font-bold mb-4 text-destructive">Danger Zone</h2>
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full justify-start text-destructive hover:text-destructive border-destructive/50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="w-full justify-start text-destructive hover:text-destructive border-destructive/50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? 'Deleting account...' : 'Delete Account'}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Settings;
