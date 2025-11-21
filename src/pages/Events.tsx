import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import db from '@/lib/cocobase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sendNotificationEmail } from '@/lib/cocomailer';
import { WorkspaceNameBanner } from '@/components/WorkspaceNameBanner';

const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL as string | undefined;

interface EventData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  maxAttendees: number;
  image: string;
  rsvp: boolean;
  ownerId: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  maxAttendees: number;
  image: string;
  rsvp: boolean;
}

const Events = () => {
  const { user } = useAuth();
  const workspaceId = (user as any)?.workspaceId ?? (user as any)?.id;
  const userRole = (user as any)?.role as string | undefined;
  const isOwner = !(user as any)?.workspaceId;
  const isAdmin = userRole === 'Admin' || isOwner;
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatEvent, setChatEvent] = useState<Event | null>(null);
  const [chatMessage, setChatMessage] = useState('');

  const {
    data: eventDocs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['events', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const docs = await db.listDocuments<EventData>('events', {
        filters: { ownerId: workspaceId },
        sort: 'date',
        order: 'asc',
      });
      return docs;
    },
    enabled: !!workspaceId,
  });

  const allEvents: Event[] = eventDocs.map((doc: any) => ({
    id: doc.id,
    title: doc.data?.title,
    description: doc.data?.description,
    date: doc.data?.date,
    time: doc.data?.time,
    location: doc.data?.location,
    attendees: doc.data?.attendees ?? 0,
    maxAttendees: doc.data?.maxAttendees ?? 0,
    image:
      doc.data?.image ||
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    rsvp: !!doc.data?.rsvp,
  }));

  const now = new Date();
  const events = allEvents.filter((event) => {
    const eventDate = new Date(`${event.date}T${event.time || '00:00'}`);
    if (filter === 'upcoming') return eventDate >= now;
    if (filter === 'past') return eventDate < now;
    return true;
  });

  const {
    data: chatDocs = [],
    isLoading: chatLoading,
    isError: chatError,
  } = useQuery({
    queryKey: ['event-chats', workspaceId, chatEvent?.id],
    queryFn: async () => {
      if (!workspaceId || !chatEvent) return [];
      const docs = await db.listDocuments('event_chats', {
        filters: { ownerId: workspaceId, eventId: chatEvent.id },
        sort: 'created_at',
        order: 'asc',
      });
      return docs as any[];
    },
    enabled: chatOpen && !!workspaceId && !!chatEvent,
    refetchInterval: chatOpen ? 5000 : false,
  });

  const chatMessages = (chatDocs as any[]).map((doc: any) => ({
    id: doc.id,
    authorId: doc.data?.authorId as string | undefined,
    authorName: doc.data?.authorName || 'Member',
    message: doc.data?.message || '',
    createdAt: doc.data?.createdAt,
  }));

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chatOpen) return;
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [chatOpen, chatMessages.length]);

  const createEventMutation = useMutation({
    mutationFn: async () => {
      if (!workspaceId) throw new Error('Not authenticated');
      if (!isAdmin) throw new Error('Not authorized to create events');
      const data: EventData = {
        title,
        description,
        date,
        time,
        location,
        maxAttendees: Number(maxAttendees || 0),
        attendees: 0,
        rsvp: false,
        image:
          imageUrl ||
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
        ownerId: workspaceId,
      };
      return db.createDocument<EventData>('events', data);
    },
    onSuccess: async (doc: any) => {
      queryClient.invalidateQueries({ queryKey: ['events', workspaceId] });
      toast.success('Event created successfully!');
      setIsCreateModalOpen(false);
      setTitle('');
      setDescription('');
      setDate('');
      setTime('');
      setLocation('');
      setMaxAttendees('');

      const baseUrl = APP_BASE_URL || window.location.origin;

      // In-app notification document
      try {
        if (workspaceId) {
          const nowIso = new Date().toISOString();
          await db.createDocument('notifications', {
            ownerId: workspaceId,
            type: 'event',
            title: doc?.data?.title || 'New event',
            body: doc?.data?.description || '',
            url: '/events',
            createdAt: nowIso,
          });
        }
      } catch (err) {
        console.log('EVENT NOTIFICATION DOC ERROR:', err);
      }

      // Email workspace members about the new event
      try {
        if (workspaceId) {
          const members: any[] = await db.listDocuments('members', {
            filters: { ownerId: workspaceId },
          });
          const recipients = members
            .map((m) => (m as any).data?.email as string | undefined)
            .filter(Boolean) as string[];

          if (recipients.length) {
            const data = doc?.data || {};
            const eventTitle = (data.title as string | undefined) || 'Community event';
            const date = data.date as string | undefined;
            const time = (data.time as string | undefined) || '';
            let dateLabel = '';
            if (date) {
              try {
                const dt = new Date(`${date}T${time || '00:00'}`);
                dateLabel = dt.toLocaleString();
              } catch {
                dateLabel = `${date} ${time}`.trim();
              }
            }

            const desc = (data.description as string | undefined) || '';
            const combinedBody = dateLabel
              ? `${eventTitle} • ${dateLabel}\n\n${desc}`
              : `${eventTitle}\n\n${desc}`;

            await sendNotificationEmail({
              recipients,
              subject: `New event: ${eventTitle}`,
              title: eventTitle,
              body: combinedBody,
              ctaLabel: 'View events',
              ctaUrl: `${baseUrl}/events`,
            });
          }
        }
      } catch (err) {
        console.log('EVENT EMAIL NOTIFY ERROR:', err);
      }
    },
    onError: (err: any) => {
      console.log('COCOBASE EVENTS CREATE ERROR:', err);
      toast.error('Failed to create event');
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!workspaceId) throw new Error('Not authenticated');
      if (!isAdmin) throw new Error('Not authorized to delete events');
      await db.deleteDocument('events', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', workspaceId] });
      toast.success('Event deleted');
    },
    onError: (err: any) => {
      console.log('COCOBASE EVENTS DELETE ERROR:', err);
      toast.error('Failed to delete event');
    },
  });

  const rsvpMutation = useMutation({
    mutationFn: async (payload: {
      id: string;
      currentRsvp: boolean;
      attendees: number;
    }) => {
      const newRsvp = !payload.currentRsvp;
      const newAttendees = newRsvp
        ? payload.attendees + 1
        : Math.max(0, payload.attendees - 1);
      await db.updateDocument<EventData>('events', payload.id, {
        rsvp: newRsvp,
        attendees: newAttendees,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', workspaceId] });
      toast.success(variables.currentRsvp ? 'RSVP cancelled' : 'RSVP confirmed!');
    },
    onError: (err: any) => {
      console.log('COCOBASE EVENTS RSVP ERROR:', err);
      toast.error('Failed to update RSVP');
    },
  });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('You do not have permission to create events');
      return;
    }
    await createEventMutation.mutateAsync();
  };

  const handleRSVP = (event: Event) => {
    rsvpMutation.mutate({
      id: event.id,
      currentRsvp: event.rsvp,
      attendees: event.attendees,
    });
  };

  const handleDeleteEvent = (id: string) => {
    if (!isAdmin) {
      toast.error('You do not have permission to delete events');
      return;
    }
    const confirmed = window.confirm(
      'Are you sure you want to delete this event? This action cannot be undone.',
    );
    if (!confirmed) return;
    deleteEventMutation.mutate(id);
  };

  const handleOpenChat = (event: Event) => {
    setChatEvent(event);
    setChatOpen(true);
  };

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!workspaceId || !chatEvent || !user) {
        throw new Error('Not authenticated');
      }
      const trimmed = chatMessage.trim();
      if (!trimmed) {
        throw new Error('Message is empty');
      }
      const now = new Date().toISOString();
      await db.createDocument('event_chats', {
        ownerId: workspaceId,
        eventId: chatEvent.id,
        authorId: (user as any)?.id,
        authorName:
          (user as any)?.name || (user as any)?.email || 'Member',
        message: trimmed,
        createdAt: now,
      });
    },
    onSuccess: () => {
      setChatMessage('');
      queryClient.invalidateQueries({
        queryKey: ['event-chats', workspaceId, chatEvent?.id],
      });
    },
    onError: (err: any) => {
      console.log('COCOBASE EVENT CHAT SEND ERROR:', err);
      toast.error('Failed to send message');
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatMessage.trim();
    if (!trimmed) {
      toast.error('Please write a message');
      return;
    }
    await sendMessageMutation.mutateAsync();
  };

  const getTimeUntil = (date: string, time: string) => {
    const eventDate = new Date(`${date}T${time}`);
    const now = new Date();
    const diff = eventDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} days`;
    if (hours > 0) return `${hours} hours`;
    return 'Soon';
  };

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Events</h1>
          <p className="text-muted-foreground">Discover and manage community events</p>
        </div>

        {isAdmin && (
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="space-y-2">
                <Label>Event Title</Label>
                <Input
                  placeholder="Summer Meetup"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Tell us about the event..."
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="Central Park, NYC"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Event Image URL (optional)</Label>
                <Input
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Attendees</Label>
                <Input
                  type="number"
                  placeholder="100"
                  required
                  value={maxAttendees}
                  onChange={(e) => setMaxAttendees(e.target.value)}
                />
              </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-neon-cyan to-neon-indigo">
                  Create Event
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <WorkspaceNameBanner />

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {(['all', 'upcoming', 'past'] as const).map((filterOption) => (
          <Button
            key={filterOption}
            variant={filter === filterOption ? 'default' : 'ghost'}
            onClick={() => setFilter(filterOption)}
            className={filter === filterOption ? 'bg-gradient-to-r from-neon-cyan to-neon-indigo' : ''}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </Button>
        ))}
      </div>

      {/* Events Grid */}
      {isLoading && (
        <p className="text-muted-foreground text-sm">Loading events...</p>
      )}
      {isError && (
        <p className="text-destructive text-sm">Failed to load events.</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card overflow-hidden hover:neon-glow-cyan transition-shadow cursor-pointer group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-neon-cyan text-background font-semibold">
                    {getTimeUntil(event.date, event.time)}
                  </Badge>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold">{event.title}</h3>
                <p className="text-muted-foreground text-sm line-clamp-2">{event.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{event.attendees} / {event.maxAttendees} attending</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => handleOpenChat(event)}
                  >
                    Open Chat
                  </Button>
                  <Button
                    onClick={() => handleRSVP(event)}
                    className={`w-full sm:w-auto ${
                      event.rsvp
                        ? 'bg-muted hover:bg-muted/80'
                        : 'bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90'
                    }`}
                  >
                    {event.rsvp ? 'Cancel RSVP' : 'RSVP Now'}
                  </Button>
                  {isAdmin && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto text-destructive border-destructive/50"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      {chatEvent && (
        <Dialog open={chatOpen} onOpenChange={setChatOpen}>
          <DialogContent className="glass-card max-w-lg w-full mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle>Chat about {chatEvent.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="max-h-64 sm:max-h-[60vh] overflow-y-auto space-y-3 rounded-lg border border-border/40 p-3 bg-background/40">
                {chatLoading && (
                  <p className="text-xs text-muted-foreground">
                    Loading messages...
                  </p>
                )}
                {chatError && (
                  <p className="text-xs text-destructive">
                    Failed to load messages.
                  </p>
                )}
                {!chatLoading && chatMessages.length === 0 && !chatError && (
                  <p className="text-xs text-muted-foreground">
                    No messages yet. Start the conversation!
                  </p>
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
                      className={`flex text-sm ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
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
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  rows={3}
                  placeholder="Share an update with attendees..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                />
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90"
                  disabled={sendMessageMutation.isPending}
                >
                  {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Events;
