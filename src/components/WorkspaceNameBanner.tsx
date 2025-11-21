import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import db from '@/lib/cocobase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { toast } from 'sonner';

interface WorkspaceNameData {
  name: string | null;
}

export const WorkspaceNameBanner = () => {
  const { user } = useAuth();
  const workspaceId = (user as any)?.workspaceId ?? (user as any)?.id;
  const role = (user as any)?.role as string | undefined;
  const isOwner = !(user as any)?.workspaceId;
  const isAdmin = role === 'Admin' || isOwner;
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');

  const { data, isLoading } = useQuery<WorkspaceNameData>({
    queryKey: ['workspace-name', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return { name: null };
      try {
        const docs = await db.listDocuments('members', {
          filters: { ownerId: workspaceId },
          sort: 'created_at',
          order: 'asc',
        });

        let name: string | null = null;
        const docsAny = docs as any[];

        for (const doc of docsAny) {
          const data = (doc as any).data || {};
          if (data.workspaceName || data.communityName) {
            name = (data.workspaceName as string) || (data.communityName as string);
            break;
          }
        }

        if (!name && docsAny.length) {
          const first = docsAny[0];
          const d = first.data || {};
          const roleLabel = (d.displayRole as string | undefined) || (d.role as string | undefined);
          name =
            (d.workspaceName as string | undefined) ||
            (d.communityName as string | undefined) ||
            (roleLabel ? `${roleLabel} community` : null);
        }

        return { name: name ?? null };
      } catch (err) {
        console.log('WORKSPACE NAME LOAD ERROR:', err);
        return { name: null };
      }
    },
    enabled: !!workspaceId,
  });

  useEffect(() => {
    if (data?.name && !editing) {
      setDraftName(data.name);
    }
  }, [data?.name, editing]);

  const saveMutation = useMutation({
    mutationFn: async (newName: string) => {
      if (!workspaceId || !user) throw new Error('Not authenticated');
      const trimmed = newName.trim();
      if (!trimmed) throw new Error('Name cannot be empty');

      const now = new Date().toISOString();

      let memberDocs: any[] = [];
      try {
        memberDocs = await db.listDocuments('members', {
          filters: { ownerId: workspaceId },
          sort: 'created_at',
          order: 'asc',
        });
      } catch (err) {
        console.log('WORKSPACE NAME MEMBERS FETCH ERROR:', err);
      }

      if (!memberDocs.length) {
        try {
          await db.createDocument('members', {
            ownerId: workspaceId,
            authUserId: (user as any)?.id,
            email: (user as any)?.email,
            name: (user as any)?.name || (user as any)?.email || 'Admin',
            role: (user as any)?.role || 'Admin',
            displayRole: 'Admin',
            status: 'active',
            joinedAt: now,
            avatar: (user as any)?.avatar || undefined,
            workspaceName: trimmed,
            communityName: trimmed,
          });
        } catch (err) {
          console.log('WORKSPACE NAME MEMBER CREATE ERROR:', err);
        }
      } else {
        await Promise.all(
          (memberDocs as any[]).map((doc) =>
            db.updateDocument('members', doc.id, {
              workspaceName: trimmed,
              communityName: trimmed,
            }),
          ),
        );
      }

      try {
        await db.updateDocument('workspaces', workspaceId, {
          name: trimmed,
        });
      } catch (err) {
        console.log('WORKSPACE NAME WORKSPACES UPDATE ERROR:', err);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-name', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['navbar-memberships', (user as any)?.id] });
      queryClient.invalidateQueries({ queryKey: ['members', workspaceId] });
      toast.success('Community name saved');
    },
    onError: (err: any) => {
      console.log('WORKSPACE NAME SAVE ERROR:', err);
      toast.error('Failed to save community name');
    },
  });

  if (!workspaceId) return null;

  const currentName = data?.name || null;
  const displayName = currentName || `Community ${String(workspaceId).slice(0, 6)}`;

  const handleStartEdit = () => {
    setDraftName(currentName || '');
    setEditing(true);
  };

  const handleSave = async () => {
    await saveMutation.mutateAsync(draftName);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraftName(currentName || '');
    setEditing(false);
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-background/80 backdrop-blur-sm px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-indigo flex items-center justify-center text-background shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Current community</p>
          {!editing ? (
            <p className="text-lg sm:text-xl font-semibold leading-tight">
              {displayName}
              {!currentName && isAdmin && !isLoading && (
                <span className="ml-2 text-[11px] text-muted-foreground">
                  (set a friendly name for your members)
                </span>
              )}
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 mt-1">
              <Input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="e.g. Skill Stream Technology"
                className="flex-1 min-w-0"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90"
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saveMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground hidden sm:block">
            This name appears across your dashboard, chat, and workspace switcher so members always know where they are.
          </p>
          <p className="text-[11px] text-muted-foreground sm:hidden">
            Visible to everyone in this community.
          </p>
        </div>
      </div>
      {isAdmin && !editing && (
        <div className="flex justify-start sm:justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleStartEdit}
            disabled={isLoading || saveMutation.isPending}
          >
            {currentName ? 'Edit name' : 'Set name'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WorkspaceNameBanner;
