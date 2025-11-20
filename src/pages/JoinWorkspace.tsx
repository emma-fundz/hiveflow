import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import db from '@/lib/cocobase';
import { useAuth } from '@/context/AuthContext';

interface JoinTokenPayload {
  workspaceId: string;
  role?: string;
}

function decodeJoinToken(token: string): JoinTokenPayload | null {
  try {
    const decoded = decodeURIComponent(token);
    const json = window.atob(decoded);
    const payload = JSON.parse(json);
    return payload;
  } catch (err) {
    console.log('JOIN WORKSPACE TOKEN DECODE ERROR:', err);
    return null;
  }
}

const JoinWorkspace = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, register, refreshUser } = useAuth();

  const [payload, setPayload] = useState<JoinTokenPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [autoJoinAttempted, setAutoJoinAttempted] = useState(false);

  useEffect(() => {
    (async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      const decoded = decodeJoinToken(token);
      if (!decoded || !decoded.workspaceId) {
        toast.error('Invalid or expired join link.');
        setLoading(false);
        return;
      }
      setPayload(decoded);
      setLoading(false);
    })();
  }, [token]);

  // If the visitor is already logged in, automatically join them to this workspace
  useEffect(() => {
    if (!payload || !payload.workspaceId) return;
    if (!isAuthenticated || !user) return;
    if (autoJoinAttempted) return;

    setAutoJoinAttempted(true);

    (async () => {
      try {
        const workspaceId = payload.workspaceId;
        const authUserId = (user as any)?.id as string | undefined;
        const email = (user as any)?.email as string | undefined;
        const displayName =
          (user as any)?.name || email || 'Member';
        const role = payload.role || 'Member';

        if (!authUserId || !workspaceId) return;

        let existing: any[] = [];
        try {
          existing = await db.listDocuments('members', {
            filters: { ownerId: workspaceId, authUserId },
          });
        } catch (err) {
          console.log('JOIN WORKSPACE EXISTING MEMBER LOOKUP ERROR:', err);
        }

        if (!existing.length) {
          const now = new Date().toISOString();
          await db.createDocument('members', {
            name: displayName,
            email,
            phone: '',
            role,
            displayRole: role,
            status: 'active',
            joinedAt: now,
            avatar:
              (user as any)?.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                displayName || email || 'Member',
              )}`,
            ownerId: workspaceId,
            authUserId,
          });
        }

        await refreshUser();
        toast.success('You have joined this community!');
        navigate('/dashboard');
      } catch (err) {
        console.log('JOIN WORKSPACE EXISTING USER ERROR:', err);
        toast.error('Failed to join community');
        setAutoJoinAttempted(false);
      }
    })();
  }, [payload, isAuthenticated, user, refreshUser, navigate, autoJoinAttempted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payload || !payload.workspaceId) {
      toast.error('Invalid join link.');
      return;
    }

    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setSubmitting(true);
      const role = payload.role || 'Member';

      await register(name, email, password, {
        role,
        workspaceId: payload.workspaceId,
      });

      try {
        const rawUser = (db as any).user as any;
        const authUserId = rawUser?.id as string | undefined;
        const now = new Date().toISOString();

        if (authUserId) {
          await db.createDocument('members', {
            name,
            email,
            phone: '',
            role,
            displayRole: role,
            status: 'active',
            joinedAt: now,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
              name || email || 'Member',
            )}`,
            ownerId: payload.workspaceId,
            authUserId,
          });
        }
      } catch (err) {
        console.log('JOIN WORKSPACE MEMBER CREATE ERROR:', err);
      }

      try {
        await refreshUser();
      } catch (err) {
        console.log('JOIN WORKSPACE REFRESH ERROR:', err);
      }

      toast.success('Welcome to your new community!');
      navigate('/splash');
    } catch (err) {
      console.log('JOIN WORKSPACE ERROR:', err);
      toast.error('Failed to join community');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card p-8">
          <h1 className="text-3xl font-bold mb-2 text-center">Join Community</h1>
          <p className="text-muted-foreground mb-6 text-center text-sm">
            {loading
              ? 'Validating your join link...'
              : payload
              ? 'Create your account to join this community on HiveFlow.'
              : 'This join link is not valid.'}
          </p>

          {!loading && payload && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="block text-sm font-medium mb-1">Full Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-1">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-1">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a secure password"
                  required
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-1">Confirm Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90"
                disabled={submitting}
              >
                {submitting ? 'Joining...' : 'Join Community'}
              </Button>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default JoinWorkspace;
