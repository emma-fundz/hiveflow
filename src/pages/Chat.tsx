import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import db from '@/lib/cocobase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { MessageCircle, Send } from 'lucide-react';
import { WorkspaceNameBanner } from '@/components/WorkspaceNameBanner';

interface ChatMessage {
  id: string;
  authorId?: string;
  authorName: string;
  authorAvatar?: string;
  message: string;
  createdAt?: string;
}

const Chat = () => {
  const { user } = useAuth();
  const workspaceId = (user as any)?.workspaceId ?? (user as any)?.id;
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');

  const {
    data: messageDocs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['community-chat', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [] as any[];
      const docs = await db.listDocuments('community_chats', {
        filters: { ownerId: workspaceId },
        sort: 'created_at',
        order: 'asc',
      });
      return docs as any[];
    },
    enabled: !!workspaceId,
    refetchInterval: 3000,
  });

  const chatMessages: ChatMessage[] = (messageDocs as any[]).map((doc: any) => ({
    id: doc.id,
    authorId: doc.data?.authorId as string | undefined,
    authorName: (doc.data?.authorName as string | undefined) || 'Member',
    authorAvatar: doc.data?.authorAvatar as string | undefined,
    message: (doc.data?.message as string | undefined) || '',
    createdAt: doc.data?.createdAt as string | undefined,
  }));

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [chatMessages.length]);

  const renderMessageWithMentions = (text: string) => {
    const parts = text.split(/(\s+)/); // keep spaces
    return parts.map((part, idx) => {
      if (part.startsWith('@') && part.length > 1) {
        return (
          <span key={idx} className="text-neon-cyan font-semibold">
            {part}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!workspaceId || !user) {
        throw new Error('Not authenticated');
      }
      const trimmed = message.trim();
      if (!trimmed) {
        throw new Error('Message is empty');
      }
      const now = new Date().toISOString();
      await db.createDocument('community_chats', {
        ownerId: workspaceId,
        authorId: (user as any)?.id,
        authorName:
          (user as any)?.name || (user as any)?.email || 'Member',
        authorAvatar: (user as any)?.avatar || null,
        message: trimmed,
        createdAt: now,
      });
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({
        queryKey: ['community-chat', workspaceId],
      });
    },
    onError: (err: any) => {
      console.log('COMMUNITY CHAT SEND ERROR:', err);
      toast.error('Failed to send message');
    },
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      toast.error('Please write a message');
      return;
    }
    await sendMessageMutation.mutateAsync();
  };

  const communityLabel = (user as any)?.currentWorkspaceLabel || 'Your community';

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageCircle className="w-7 h-7 text-primary" />
            Community Chat
          </h1>
          <p className="text-muted-foreground text-sm">
            Hang out with your members, share quick updates, and talk about events &amp; announcements.
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end text-xs text-muted-foreground">
          <span className="font-medium">Workspace</span>
          <Badge variant="outline" className="mt-1 max-w-[220px] truncate">
            {communityLabel}
          </Badge>
        </div>
      </div>

      <div className="mb-4">
        <WorkspaceNameBanner />
      </div>

      {/* Messages area */}
      <div className="flex-1 min-h-0 mb-4">
        <div className="h-full rounded-2xl border border-border/50 bg-background/60 backdrop-blur-sm flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-border/60 text-xs text-muted-foreground flex items-center justify-between">
            <span>Global chat for this community</span>
            <div className="hidden sm:flex gap-3">
              <Link to="/events" className="hover:text-primary underline-offset-2 hover:underline">
                View events
              </Link>
              <Link to="/announcements" className="hover:text-primary underline-offset-2 hover:underline">
                View announcements
              </Link>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3">
            {isLoading && (
              <p className="text-xs text-muted-foreground">Loading messages...</p>
            )}
            {isError && (
              <p className="text-xs text-destructive">Failed to load messages.</p>
            )}
            {!isLoading && !isError && chatMessages.length === 0 && (
              <div className="text-center text-xs text-muted-foreground py-8 px-4">
                <p className="mb-1 font-medium">No messages yet</p>
                <p>Start the conversation! Say hi or tag someone with @name.</p>
              </div>
            )}
            {chatMessages.map((msg) => {
              const isOwn = (user as any)?.id && msg.authorId === (user as any)?.id;
              const createdAtLabel = msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 text-sm ${
                    isOwn ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isOwn && (
                    <Avatar className="w-7 h-7 hidden sm:inline-flex">
                      <AvatarImage src={msg.authorAvatar} />
                      <AvatarFallback>{msg.authorName?.[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm ${
                      isOwn
                        ? 'bg-gradient-to-r from-neon-cyan to-neon-indigo text-background rounded-br-sm'
                        : 'bg-background/80 border border-border/40 text-foreground rounded-bl-sm'
                    }`}
                  >
                    {!isOwn && (
                      <p className="font-semibold text-xs mb-0.5">{msg.authorName}</p>
                    )}
                    <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                      {renderMessageWithMentions(msg.message)}
                    </p>
                    {createdAtLabel && (
                      <p className="text-[10px] text-muted-foreground/80 mt-1 text-right">
                        {createdAtLabel}
                      </p>
                    )}
                  </div>
                  {isOwn && (
                    <Avatar className="w-7 h-7 hidden sm:inline-flex">
                      <AvatarImage src={(user as any)?.avatar} />
                      <AvatarFallback>{(user as any)?.name?.[0]}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Composer */}
      <form onSubmit={handleSend} className="mt-auto">
        <div className="rounded-2xl border border-border/60 bg-background/80 backdrop-blur-sm p-3 flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <Textarea
              rows={2}
              placeholder="Write a message, use @name to tag someone..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-none"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Tip: Talk about upcoming events and announcements here so your community stays in sync.
            </p>
          </div>
          <Button
            type="submit"
            className="w-full sm:w-auto bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90 flex items-center justify-center gap-2"
            disabled={sendMessageMutation.isPending}
          >
            <Send className="w-4 h-4" />
            {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
