import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import db from '@/lib/cocobase';
import { useAuth } from '@/context/AuthContext';

interface MemberInvite {
  id: string;
  email: string;
  name: string;
  role: string;
  workspaceId: string;
}

interface InviteTokenPayload {
  email: string;
  name?: string;
  role?: string;
  workspaceId: string;
  issuedAt?: string;
}

function decodeInviteToken(token: string): InviteTokenPayload | null {
  try {
    const decoded = decodeURIComponent(token);
    const json = window.atob(decoded);
    const payload = JSON.parse(json);
    return payload;
  } catch (err) {
    console.log('INVITE TOKEN DECODE ERROR:', err);
    return null;
  }
}

const AcceptInvite = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [invite, setInvite] = useState<MemberInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const payload = decodeInviteToken(token);
        if (!payload || !payload.email || !payload.workspaceId) {
          toast.error('Invalid or expired invite link.');
          setLoading(false);
          return;
        }

        const docs: any[] = await db.listDocuments('members', {
          filters: { ownerId: payload.workspaceId, email: payload.email },
          sort: 'created_at',
          order: 'desc',
        });
        if (!docs.length) {
          toast.error('Invite not found or already used.');
          setLoading(false);
          return;
        }
        const doc = docs[0];
        const data = doc.data || {};
        setInvite({
          id: doc.id,
          email: payload.email,
          name: payload.name || data.name || payload.email,
          role: payload.role || data.role || 'Member',
          workspaceId: payload.workspaceId,
        });
      } catch (err) {
        console.log('COCOBASE FETCH INVITE ERROR:', err);
        toast.error('Failed to load invite.');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invite) return;

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
      await register(invite.name, invite.email, password, {
        role: invite.role,
        workspaceId: invite.workspaceId,
      });

      try {
        await db.updateDocument('members', invite.id, {
          status: 'active',
          authUserId: (db as any).user?.id,
          joinedAt: new Date().toISOString(),
          inviteToken: null,
        });
      } catch (err) {
        console.log('COCOBASE ACCEPT INVITE UPDATE ERROR:', err);
      }

      toast.success('Your account has been created!');
      navigate('/dashboard');
    } catch (err) {
      console.log('ACCEPT INVITE ERROR:', err);
      toast.error('Failed to accept invite');
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
          <h1 className="text-3xl font-bold mb-2 text-center">Accept Invite</h1>
          <p className="text-muted-foreground mb-6 text-center text-sm">
            {loading
              ? 'Loading your invite...'
              : invite
              ? `You have been invited as a ${invite.role} to this workspace.`
              : 'Invite not found.'}
          </p>

          {!loading && invite && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input value={invite.email} disabled className="bg-muted" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input value={invite.name} disabled className="bg-muted" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Set Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a secure password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password</label>
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
                {submitting ? 'Creating account...' : 'Accept Invite'}
              </Button>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default AcceptInvite;
