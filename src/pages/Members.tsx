import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, MoreVertical, Mail, Phone, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import db from '@/lib/cocobase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sendInviteEmail } from '@/lib/cocomailer';

const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL as string | undefined;

interface MemberData {
  name: string;
  email: string;
  phone: string;
  role: string;
  joinedAt: string;
  avatar: string;
  status: 'active' | 'inactive';
  ownerId: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  joinedDate: string;
  avatar: string;
  status: 'active' | 'inactive';
}

const Members = () => {
  const { user } = useAuth();
  const workspaceId = (user as any)?.workspaceId ?? (user as any)?.id;
  const userRole = (user as any)?.role as string | undefined;
  const isOwner = !(user as any)?.workspaceId;
  const isAdmin = userRole === 'Admin' || isOwner;
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('Member');

  const {
    data: memberDocs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['members', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const docs = await db.listDocuments<MemberData>('members', {
        filters: { ownerId: workspaceId },
        sort: 'created_at',
        order: 'desc',
      });
      return docs;
    },
    enabled: !!workspaceId,
  });

  const members: Member[] = memberDocs.map((doc: any) => ({
    id: doc.id,
    name: doc.data?.name,
    email: doc.data?.email,
    phone: doc.data?.phone ?? '',
    role: doc.data?.role ?? 'Member',
    joinedDate: doc.data?.joinedAt ?? doc.created_at,
    avatar:
      doc.data?.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        doc.data?.name || doc.data?.email || 'Member',
      )}`,
    status: (doc.data?.status as 'active' | 'inactive') ?? 'active',
  }));

  const createMemberMutation = useMutation({
    mutationFn: async () => {
      if (!workspaceId) throw new Error('Not authenticated');
      if (!isAdmin) throw new Error('Not authorized to add members');
      const now = new Date().toISOString();
      const tokenPayload = {
        email: newEmail,
        name: newName || newEmail,
        role: newRole,
        workspaceId,
        issuedAt: now,
      };
      let inviteToken: string;
      try {
        inviteToken = window.btoa(JSON.stringify(tokenPayload));
      } catch (err) {
        console.log('INVITE TOKEN ENCODE ERROR:', err);
        throw new Error('Failed to generate invite link');
      }

      const data: MemberData = {
        name: newName,
        email: newEmail,
        phone: newPhone,
        role: newRole,
        status: 'active',
        joinedAt: now,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          newName || newEmail || 'Member',
        )}`,
        ownerId: workspaceId,
      };

      console.log(
        'COCOBASE MEMBERS CREATE REQUEST:',
        JSON.stringify(
          {
            collection: 'members',
            workspaceId,
            payload: data,
          },
          null,
          2,
        ),
      );

      try {
        const doc = await db.createDocument<MemberData>('members', data);

        console.log(
          'COCOBASE MEMBERS CREATE RESPONSE:',
          JSON.stringify(
            {
              id: (doc as any)?.id,
              created_at: (doc as any)?.created_at,
              data: (doc as any)?.data,
            },
            null,
            2,
          ),
        );

        try {
          const baseUrl = APP_BASE_URL || window.location.origin;
          const inviteLink = `${baseUrl}/accept-invite/${encodeURIComponent(inviteToken)}`;
          await sendInviteEmail({
            to: newEmail,
            name: newName || newEmail,
            role: newRole,
            inviteLink,
          });
        } catch (err: any) {
          const mailerError = {
            message: err?.message,
            name: err?.name,
            code: (err as any)?.code,
          };
          console.error('COCO_MAILER INVITE ERROR:', JSON.stringify(mailerError, null, 2));
        }

        return doc;
      } catch (err: any) {
        const serializedError: any = {
          message: err?.message,
          name: err?.name,
        };
        if (err?.status || err?.statusCode) {
          serializedError.status = err.status || err.statusCode;
        }
        if ((err as any)?.code) {
          serializedError.code = (err as any).code;
        }
        if ((err as any)?.response) {
          try {
            serializedError.responseStatus = (err as any).response.status;
            serializedError.responseStatusText = (err as any).response.statusText;
          } catch {
            // ignore
          }
        }

        console.error(
          'COCOBASE MEMBERS CREATE ERROR (SERIALIZED):',
          JSON.stringify(serializedError, null, 2),
        );

        try {
          console.error(
            'COCOBASE MEMBERS CREATE ERROR (RAW JSON):',
            JSON.stringify(err, Object.getOwnPropertyNames(err), 2),
          );
        } catch {
          console.error('COCOBASE MEMBERS CREATE ERROR (RAW STRING):', String(err));
        }

        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', workspaceId] });
      toast.success('Member invited successfully!');
      setIsAddModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewRole('Member');
    },
    onError: (err: any) => {
      const onErrorInfo = {
        message: err?.message,
        name: err?.name,
        stack: err?.stack,
      };
      console.error(
        'COCOBASE MEMBERS CREATE ERROR (REACT-QUERY ONERROR):',
        JSON.stringify(onErrorInfo, null, 2),
      );
      toast.error('Failed to add member');
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      await db.deleteDocument('members', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', user?.id] });
      toast.success('Member removed');
    },
    onError: (err: any) => {
      console.log('COCOBASE MEMBERS DELETE ERROR:', err);
      toast.error('Failed to remove member');
    },
  });

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('You do not have permission to add members');
      return;
    }
    if (!newName || !newEmail) {
      toast.error('Name and email are required');
      return;
    }
    await createMemberMutation.mutateAsync();
  };

  const handleDeleteMember = (id: string) => {
    if (!isAdmin) {
      toast.error('You do not have permission to remove members');
      return;
    }
    deleteMemberMutation.mutate(id);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Members</h1>
          <p className="text-muted-foreground">Manage your community members</p>
        </div>

        {isAdmin && (
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMember} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="John Doe"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  placeholder="+1 234 567 890"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <select
                  className="w-full p-2 rounded-lg bg-background border border-border"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="Member">Member</option>
                  <option value="Moderator">Moderator</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-neon-cyan to-neon-indigo">
                  Add Member
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search Bar */}
      <Card className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Members Table */}
      {isLoading && (
        <p className="text-muted-foreground text-sm px-1">Loading members...</p>
      )}
      {isError && (
        <p className="text-destructive text-sm px-1">Failed to load members.</p>
      )}
      <Card className="glass-card p-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-4">Member</th>
              <th className="text-left py-4 px-4">Contact</th>
              <th className="text-left py-4 px-4">Role</th>
              <th className="text-left py-4 px-4">Status</th>
              <th className="text-left py-4 px-4">Joined</th>
              <th className="text-left py-4 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member, index) => (
              <motion.tr
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-border/50 hover:bg-muted/50 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full ring-2 ring-primary/20"
                    />
                    <span className="font-medium">{member.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{member.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{member.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>{member.role}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <Badge
                    variant={member.status === 'active' ? 'default' : 'secondary'}
                    className={member.status === 'active' ? 'bg-green-500/20 text-green-500' : ''}
                  >
                    {member.status}
                  </Badge>
                </td>
                <td className="py-4 px-4 text-muted-foreground">
                  {new Date(member.joinedDate).toLocaleDateString()}
                </td>
                <td className="py-4 px-4">
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default Members;
