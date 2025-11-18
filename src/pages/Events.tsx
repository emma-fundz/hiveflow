import { useState } from 'react';
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
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');

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

  const createEventMutation = useMutation({
    mutationFn: async () => {
      if (!workspaceId) throw new Error('Not authenticated');
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
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
        ownerId: workspaceId,
      };
      return db.createDocument<EventData>('events', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', workspaceId] });
      toast.success('Event created successfully!');
      setIsCreateModalOpen(false);
      setTitle('');
      setDescription('');
      setDate('');
      setTime('');
      setLocation('');
      setMaxAttendees('');
    },
    onError: (err: any) => {
      console.log('COCOBASE EVENTS CREATE ERROR:', err);
      toast.error('Failed to create event');
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
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
      toast.success(variables.currentRsvp ? 'RSVP cancelled' : 'RSVP confirmed!');
    },
    onError: (err: any) => {
      console.log('COCOBASE EVENTS RSVP ERROR:', err);
      toast.error('Failed to update RSVP');
    },
  });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    await createEventMutation.mutateAsync();
  };

  const handleRSVP = (event: Event) => {
    rsvpMutation.mutate({
      id: event.id,
      currentRsvp: event.rsvp,
      attendees: event.attendees,
    });
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Events</h1>
          <p className="text-muted-foreground">Discover and manage community events</p>
        </div>

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
      </div>

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

                <Button
                  onClick={() => handleRSVP(event)}
                  className={`w-full ${event.rsvp ? 'bg-muted hover:bg-muted/80' : 'bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90'}`}
                >
                  {event.rsvp ? 'Cancel RSVP' : 'RSVP Now'}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Events;
