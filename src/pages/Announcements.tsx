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
  likes: number;
  comments: number;
  isLiked: boolean;
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
  
  const draftKey = `announcement-draft-${user?.id || 'guest'}`;
  const { loadDraft, clearDraft, forceSave } = useDrafts({
    key: draftKey,
    value: newAnnouncement,
    delay: 5000,
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

  const announcements: Announcement[] = announcementDocs.map((doc: any) => ({
    id: doc.id,
    author: {
      name: doc.data?.authorName,
      avatar:
        doc.data?.authorAvatar ||
        'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
      role: doc.data?.authorRole ?? 'Admin',
    },
    content: doc.data?.content,
    timestamp: doc.data?.createdAt
      ? new Date(doc.data.createdAt).toLocaleString()
      : '',
    likes: doc.data?.likes ?? 0,
    comments: doc.data?.comments ?? 0,
    isLiked: !!doc.data?.isLiked,
  }));

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', workspaceId] });
      setNewAnnouncement('');
      clearDraft();
      setImageUrl('');
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

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
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
          <Card className="glass-card p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="w-12 h-12 ring-2 ring-primary">
                <AvatarImage src={(user as any)?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=You'} />
                <AvatarFallback>Y</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
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
                <div className="flex justify-between items-center">
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

                <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>{announcement.comments}</span>
                </button>

                <button
                  onClick={() => toast.info('Share feature coming soon!')}
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
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
