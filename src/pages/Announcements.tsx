import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useDrafts } from '@/hooks/useDrafts';
import { useAuth } from '@/context/AuthContext';

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

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    author: {
      name: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      role: 'Admin'
    },
    content: '🎉 **Exciting News!** We\'re launching a new mentorship program starting next month. Sign up now to become a mentor or find your perfect match!',
    timestamp: '2 hours ago',
    likes: 42,
    comments: 8,
    isLiked: false
  },
  {
    id: '2',
    author: {
      name: 'Mike Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      role: 'Moderator'
    },
    content: '📅 **Reminder:** Don\'t forget about tomorrow\'s community meetup at Central Park! Weather looks perfect. See you all there! 🌞',
    timestamp: '5 hours ago',
    likes: 67,
    comments: 15,
    isLiked: true
  },
  {
    id: '3',
    author: {
      name: 'Emma Wilson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
      role: 'Admin'
    },
    content: '🚀 **Platform Update:** We\'ve just rolled out new features including dark mode improvements and faster loading times. Check it out!',
    timestamp: '1 day ago',
    likes: 89,
    comments: 23,
    isLiked: true
  },
];

const Announcements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  
  const draftKey = `announcement-draft-${user?.id || 'guest'}`;
  const { loadDraft, clearDraft, forceSave } = useDrafts({
    key: draftKey,
    value: newAnnouncement,
    delay: 5000,
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

  const handlePost = () => {
    if (!newAnnouncement.trim()) {
      toast.error('Please write something');
      return;
    }

    const announcement: Announcement = {
      id: Date.now().toString(),
      author: {
        name: user?.name || 'You',
        avatar: user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
        role: 'Admin'
      },
      content: newAnnouncement,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      isLiked: false
    };

    setAnnouncements([announcement, ...announcements]);
    setNewAnnouncement('');
    clearDraft();
    toast.success('Announcement posted!');
  };

  const handleLike = (id: string) => {
    setAnnouncements(announcements.map(announcement =>
      announcement.id === id
        ? {
            ...announcement,
            isLiked: !announcement.isLiked,
            likes: announcement.isLiked ? announcement.likes - 1 : announcement.likes + 1
          }
        : announcement
    ));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Announcements</h1>
        <p className="text-muted-foreground">Stay updated with community news</p>
      </div>

      {/* New Announcement Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="w-12 h-12 ring-2 ring-primary">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=You" />
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

      {/* Announcements Feed */}
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
