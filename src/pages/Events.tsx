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

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Summer Networking Meetup',
    description: 'Join us for an evening of networking and fun activities.',
    date: '2025-02-15',
    time: '18:00',
    location: 'Central Park, NYC',
    attendees: 45,
    maxAttendees: 100,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    rsvp: false
  },
  {
    id: '2',
    title: 'Tech Workshop: AI Fundamentals',
    description: 'Learn the basics of artificial intelligence and machine learning.',
    date: '2025-02-20',
    time: '14:00',
    location: 'Innovation Hub, Building A',
    attendees: 67,
    maxAttendees: 80,
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
    rsvp: true
  },
  {
    id: '3',
    title: 'Community Picnic',
    description: 'Family-friendly outdoor gathering with games and food.',
    date: '2025-03-05',
    time: '12:00',
    location: 'Riverside Park',
    attendees: 23,
    maxAttendees: 150,
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400',
    rsvp: false
  },
];

const Events = () => {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Event created successfully!');
    setIsCreateModalOpen(false);
  };

  const handleRSVP = (eventId: string) => {
    setEvents(events.map(event =>
      event.id === eventId ? { ...event, rsvp: !event.rsvp, attendees: event.rsvp ? event.attendees - 1 : event.attendees + 1 } : event
    ));
    toast.success(events.find(e => e.id === eventId)?.rsvp ? 'RSVP cancelled' : 'RSVP confirmed!');
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
                <Input placeholder="Summer Meetup" required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Tell us about the event..." rows={3} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" required />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="Central Park, NYC" required />
              </div>
              <div className="space-y-2">
                <Label>Max Attendees</Label>
                <Input type="number" placeholder="100" required />
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
                  onClick={() => handleRSVP(event.id)}
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
