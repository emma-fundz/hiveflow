import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useDrafts } from '@/hooks/useDrafts';
import { useAuth } from '@/context/AuthContext';
import db from '@/lib/cocobase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sendNotificationEmail } from '@/lib/cocomailer';

const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL as string | undefined;

interface AnnouncementComment {
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

interface AnnouncementData {
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  ownerId: string;
  imageUrl?: string;
  commentsList?: AnnouncementComment[];
}

interface Announcement {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  timestamp: string;
   rawCreatedAt?: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  commentsList: AnnouncementComment[];
  imageUrl?: string;
}

const Announcements = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const workspaceId = (user as any)?.workspaceId ?? (user as any)?.id;
  const userRole = (user as any)?.role as string | undefined;
  const isOwner = !(user as any)?.workspaceId;
  const isAdmin = userRole === 'Admin' || isOwner;
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  
  const draftKey = `announcement-draft-${user?.id || 'guest'}`;
  const { loadDraft, clearDraft, forceSave } = useDrafts({
    key: draftKey,
    value: newAnnouncement,
    delay: 5000,
  });

  const commentMutation = useMutation({
    mutationFn: async (payload: {
      id: string;
      content: string;
      existingComments: AnnouncementComment[];
    }) => {
      if (!workspaceId) throw new Error('Not authenticated');
      if (!user) throw new Error('Not authenticated');
      const trimmed = payload.content.trim();
      if (!trimmed) throw new Error('Comment is empty');

      const now = new Date().toISOString();
      const authorName =
        (user as any)?.name ||
        (user as any)?.email ||
        'Member';
      const authorAvatar = (user as any)?.avatar as string | undefined;

      const nextList: AnnouncementComment[] = [
        ...payload.existingComments,
        {
          authorName,
          authorAvatar,
          content: trimmed,
          createdAt: now,
        },
      ];

      await db.updateDocument<AnnouncementData>('announcements', payload.id, {
        commentsList: nextList,
        comments: nextList.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', workspaceId] });
    },
    onError: (err: any) => {
      console.log('COCOBASE ANNOUNCEMENTS COMMENT ERROR:', err);
      toast.error('Failed to add comment');
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      await db.deleteDocument('announcements', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', workspaceId] });
      toast.success('Announcement deleted');
    },
    onError: (err: any) => {
      console.log('COCOBASE ANNOUNCEMENTS DELETE ERROR:', err);
      toast.error('Failed to delete announcement');
    },
  });

  const {
    data: announcementDocs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['announcements', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const docs = await db.listDocuments<AnnouncementData>('announcements', {
        filters: { ownerId: workspaceId },
        sort: 'created_at',
        order: 'desc',
      });
      return docs;
    },
    enabled: !!workspaceId,
  });

  const announcements: Announcement[] = announcementDocs.map((doc: any) => {
    const authorName = doc.data?.authorName || 'You';
    const isCurrentUserAuthor =
      !!user &&
      (authorName === (user as any)?.name || authorName === user?.email);

    return {
      id: doc.id,
      author: {
        name: authorName,
        avatar:
          (isCurrentUserAuthor && (user as any)?.avatar) ||
          doc.data?.authorAvatar ||
          'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
        role: doc.data?.authorRole ?? 'Admin',
      },
      content: doc.data?.content,
      timestamp: doc.data?.createdAt
        ? new Date(doc.data.createdAt).toLocaleString()
        : '',
      rawCreatedAt: doc.data?.createdAt,
      likes: doc.data?.likes ?? 0,
      comments:
        (Array.isArray(doc.data?.commentsList)
          ? (doc.data.commentsList as AnnouncementComment[]).length
          : doc.data?.comments) ?? 0,
      isLiked: !!doc.data?.isLiked,
      commentsList: (Array.isArray(doc.data?.commentsList)
        ? (doc.data.commentsList as AnnouncementComment[])
        : []) as AnnouncementComment[],
      imageUrl: doc.data?.imageUrl,
    };
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async () => {
      if (!workspaceId) throw new Error('Not authenticated');
      const now = new Date().toISOString();
      const data: AnnouncementData = {
        authorName: (user as any)?.name || 'You',
        authorAvatar:
          (user as any)?.avatar ||
          'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
        authorRole: 'Admin',
        content: newAnnouncement,
        createdAt: now,
        likes: 0,
        comments: 0,
        isLiked: false,
        ownerId: workspaceId,
        imageUrl: imageUrl || undefined,
      };
      return db.createDocument<AnnouncementData>('announcements', data);
    },
    onSuccess: async (doc: any) => {
      queryClient.invalidateQueries({ queryKey: ['announcements', workspaceId] });
      setNewAnnouncement('');
      clearDraft();
      setImageUrl('');

      const baseUrl = APP_BASE_URL || window.location.origin;

      // Create a simple workspace-scoped notification document
      try {
        if (workspaceId) {
          const now = new Date().toISOString();
          await db.createDocument('notifications', {
            ownerId: workspaceId,
            type: 'announcement',
            title: doc?.data?.authorName || 'New announcement',
            body: doc?.data?.content || '',
            url: '/announcements',
            createdAt: now,
          });
        }
      } catch (err) {
        console.log('ANNOUNCEMENT NOTIFICATION DOC ERROR:', err);
      }

      // Email all workspace members about the new announcement
      try {
        if (workspaceId) {
          const members: any[] = await db.listDocuments('members', {
            filters: { ownerId: workspaceId },
          });
          const recipients = members
            .map((m) => (m as any).data?.email as string | undefined)
            .filter(Boolean) as string[];

          if (recipients.length) {
            const rawContent = (doc?.data?.content as string | undefined) || '';
            const preview = rawContent.length > 160
              ? `${rawContent.slice(0, 157)}...`
              : rawContent;

            await sendNotificationEmail({
              recipients,
              subject: `New announcement from ${(user as any)?.name || 'your community'}`,
              title: 'New community announcement',
              body: preview,
              ctaLabel: 'View announcement',
              ctaUrl: `${baseUrl}/announcements`,
            });
          }
        }
      } catch (err) {
        console.log('ANNOUNCEMENT EMAIL NOTIFY ERROR:', err);
      }

      toast.success('Announcement posted!');
    },
    onError: (err: any) => {
      console.log('COCOBASE ANNOUNCEMENTS CREATE ERROR:', err);
      toast.error('Failed to post announcement');
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (payload: { id: string; isLiked: boolean; likes: number }) => {
      const newIsLiked = !payload.isLiked;
      const newLikes = newIsLiked
        ? payload.likes + 1
        : Math.max(0, payload.likes - 1);
      await db.updateDocument<AnnouncementData>('announcements', payload.id, {
        isLiked: newIsLiked,
        likes: newLikes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', workspaceId] });
    },
    onError: (err: any) => {
      console.log('COCOBASE ANNOUNCEMENTS LIKE ERROR:', err);
      toast.error('Failed to update like');
    },
  });

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setNewAnnouncement(draft);
      toast.info('Draft restored');
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to save draft
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        forceSave();
      }
      // Cmd/Ctrl + Enter to publish
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handlePost();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [newAnnouncement]);

  const handlePost = async () => {
    if (!isAdmin) {
      toast.error('You do not have permission to post announcements');
      return;
    }
    if (!newAnnouncement.trim()) {
      toast.error('Please write something');
      return;
    }
    await createAnnouncementMutation.mutateAsync();
  };

  const handleLike = (id: string) => {
    const announcement = announcements.find((a) => a.id === id);
    if (!announcement) return;
    likeMutation.mutate({
      id,
      isLiked: announcement.isLiked,
      likes: announcement.likes,
    });
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (!isAdmin) {
      toast.error('You do not have permission to delete announcements');
      return;
    }
    const confirmed = window.confirm(
      'Are you sure you want to delete this announcement? This action cannot be undone.',
    );
    if (!confirmed) return;
    deleteAnnouncementMutation.mutate(id);
  };

  const handleCommentSubmit = async (announcement: Announcement) => {
    const text = commentDrafts[announcement.id]?.trim() || '';
    if (!text) {
      toast.error('Please write a comment');
      return;
    }

    try {
      await commentMutation.mutateAsync({
        id: announcement.id,
        content: text,
        existingComments: announcement.commentsList || [],
      });
      setCommentDrafts((prev) => ({
        ...prev,
        [announcement.id]: '',
      }));
    } catch {
      // error is handled in mutation onError
    }
  };

  const handleShare = async (announcement: Announcement) => {
    try {
      const baseUrl = APP_BASE_URL || window.location.origin;
      const payload = {
        content: announcement.content,
        authorName: announcement.author.name,
        authorRole: announcement.author.role,
        createdAt: announcement.rawCreatedAt || '',
        imageUrl: announcement.imageUrl || '',
      };

      let token: string;
      try {
        token = window.btoa(JSON.stringify(payload));
      } catch (err) {
        console.log('ANNOUNCEMENT SHARE ENCODE ERROR:', err);
        toast.error('Failed to generate share link');
        return;
      }

      const url = `${baseUrl}/announcement/${encodeURIComponent(token)}`;

      if ((navigator as any).share) {
        await (navigator as any).share({
          title: `Announcement from ${announcement.author.name}`,
          text: announcement.content,
          url,
        });
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        toast.success('Share link copied to clipboard');
      } else {
        toast.info(url);
      }
    } catch (err) {
      console.log('ANNOUNCEMENT SHARE ERROR:', err);
      toast.error('Failed to share announcement');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-2 sm:px-0">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Announcements</h1>
        <p className="text-muted-foreground">Stay updated with community news</p>
      </div>

      {/* New Announcement Card (Admins only) */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <Avatar className="w-12 h-12 ring-2 ring-primary">
                <AvatarImage src={(user as any)?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=You'} />
                <AvatarFallback>Y</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4 w-full">
                <Textarea
                  placeholder="What's on your mind? Share with the community..."
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <div className="space-y-2">
                  <Label>Image URL (optional)</Label>
                  <Input
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Cmd/Ctrl+S to save • Cmd/Ctrl+Enter to publish
                  </p>
                  <Button
                    onClick={handlePost}
                    className="bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90"
                  >
                    <Megaphone className="w-4 h-4 mr-2" />
                    Post Announcement
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Announcements Feed */}
      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading announcements...</p>
      )}
      {isError && (
        <p className="text-sm text-destructive">Failed to load announcements.</p>
      )}
      <div className="space-y-6">
        {announcements.map((announcement, index) => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card p-6 hover:neon-glow-cyan transition-shadow">
              {/* Author Info */}
              <div className="flex items-start space-x-4 mb-4">
                <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                  <AvatarImage src={announcement.author.avatar} />
                  <AvatarFallback>{announcement.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{announcement.author.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      {announcement.author.role}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{announcement.timestamp}</p>
                </div>
              </div>

              {/* Content */}
              <div className="mb-4 prose prose-invert max-w-none">
                <p className="text-foreground whitespace-pre-wrap">{announcement.content}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-6 pt-4 border-t border-border">
                <button
                  onClick={() => handleLike(announcement.id)}
                  className={`flex items-center space-x-2 text-sm transition-colors ${
                    announcement.isLiked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${announcement.isLiked ? 'fill-current' : ''}`} />
                  <span>{announcement.likes}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(`comment-input-${announcement.id}`);
                    if (el) {
                      (el as HTMLInputElement).focus();
                    }
                  }}
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{announcement.comments}</span>
                </button>

                <button
                  onClick={() => handleShare(announcement)}
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="ml-auto text-xs text-destructive hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* Comments */}
              <div className="mt-4 space-y-3">
                {announcement.commentsList.length > 0 && (
                  <div className="space-y-2 text-sm text-muted-foreground max-h-40 overflow-y-auto">
                    {announcement.commentsList.map((comment, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <Avatar className="w-7 h-7">
                          <AvatarImage src={comment.authorAvatar} />
                          <AvatarFallback>
                            {comment.authorName?.[0] || 'M'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            {comment.authorName}{' '}
                            <span className="text-[10px] text-muted-foreground">
                              {comment.createdAt
                                ? new Date(comment.createdAt).toLocaleString()
                                : ''}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {user && (
                  <form
                    className="flex items-center space-x-2"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await handleCommentSubmit(announcement);
                    }}
                  >
                    <Input
                      id={`comment-input-${announcement.id}`}
                      placeholder="Write a comment..."
                      value={commentDrafts[announcement.id] || ''}
                      onChange={(e) =>
                        setCommentDrafts((prev) => ({
                          ...prev,
                          [announcement.id]: e.target.value,
                        }))
                      }
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90"
                      disabled={commentMutation.isPending}
                    >
                      Comment
                    </Button>
                  </form>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" onClick={() => toast.info('No more announcements')}>
          Load More
        </Button>
      </div>
    </div>
  );
};

export default Announcements;
