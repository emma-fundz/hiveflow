import { motion } from 'framer-motion';
import { Users, Calendar, TrendingUp, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import db from '@/lib/cocobase';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const workspaceId = (user as any)?.workspaceId ?? (user as any)?.id;
  const userRole = (user as any)?.role as string | undefined;
  const isOwner = !(user as any)?.workspaceId;
  const isAdmin = userRole === 'Admin' || isOwner;
  const navigate = useNavigate();
  const { data: memberDocs = [] } = useQuery({
    queryKey: ['dashboard-members', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const docs = await db.listDocuments('members', {
        filters: { ownerId: workspaceId },
      });
      return docs;
    },
    enabled: !!workspaceId,
  });

  const { data: eventDocs = [] } = useQuery({
    queryKey: ['dashboard-events', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const docs = await db.listDocuments('events', {
        filters: { ownerId: workspaceId },
      });
      return docs;
    },
    enabled: !!workspaceId,
  });

  const { data: announcementDocs = [] } = useQuery({
    queryKey: ['dashboard-announcements', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const docs = await db.listDocuments('announcements', {
        filters: { ownerId: workspaceId },
      });
      return docs;
    },
    enabled: !!workspaceId,
  });

  const memberDocsAny = memberDocs as any[];
  const eventDocsAny = eventDocs as any[];
  const announcementDocsAny = announcementDocs as any[];

  const memberCount = memberDocsAny.length;

  const upcomingEventsCount = eventDocsAny.filter((doc) => {
    const date = doc.data?.date;
    if (!date) return false;
    const time = doc.data?.time || '00:00';
    const eventDate = new Date(`${date}T${time}`);
    return eventDate >= new Date();
  }).length;

  const announcementCount = announcementDocsAny.length;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const isToday = (iso?: string) => {
    if (!iso) return false;
    const d = new Date(iso);
    return d >= todayStart;
  };

  const membersToday = memberDocsAny.filter((doc) =>
    isToday(doc.data?.joinedAt ?? doc.created_at),
  ).length;

  const eventsToday = eventDocsAny.filter((doc) =>
    isToday(doc.created_at),
  ).length;

  const announcementsToday = announcementDocsAny.filter((doc) =>
    isToday(doc.data?.createdAt ?? doc.created_at),
  ).length;

  const activityToday = membersToday + eventsToday + announcementsToday;

  const numberFormatter = new Intl.NumberFormat();

  const stats = [
    {
      label: 'Total Members',
      value: numberFormatter.format(memberCount),
      change: '--',
      icon: Users,
      color: 'from-neon-cyan to-blue-500',
    },
    {
      label: 'Upcoming Events',
      value: numberFormatter.format(upcomingEventsCount),
      change: '--',
      icon: Calendar,
      color: 'from-neon-indigo to-purple-500',
    },
    {
      label: 'Active Today',
      value: numberFormatter.format(activityToday),
      change: '--',
      icon: Activity,
      color: 'from-pink-500 to-rose-500',
    },
    {
      label: 'Total Announcements',
      value: numberFormatter.format(announcementCount),
      change: '--',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const formatRelativeTime = (iso?: string) => {
    if (!iso) return '';
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    }
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  };

  const activities: {
    id: string;
    title: string;
    description: string;
    timeLabel: string;
    avatar: string;
    timestamp: number;
  }[] = [];

  if (memberDocsAny.length) {
    const sorted = [...memberDocsAny].sort((a, b) => {
      const aTs = a.data?.joinedAt ?? a.created_at;
      const bTs = b.data?.joinedAt ?? b.created_at;
      return new Date(bTs).getTime() - new Date(aTs).getTime();
    });
    const latest = sorted[0];
    const name = latest.data?.name || latest.data?.email || 'New member';
    const ts = latest.data?.joinedAt ?? latest.created_at;
    const avatar =
      latest.data?.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        name,
      )}`;
    activities.push({
      id: latest.id,
      title: name,
      description: 'joined the community',
      timeLabel: formatRelativeTime(ts),
      avatar,
      timestamp: ts ? new Date(ts).getTime() : 0,
    });
  }

  if (eventDocsAny.length) {
    const sorted = [...eventDocsAny].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    const latest = sorted[0];
    const title = latest.data?.title || 'New event';
    const ts = latest.created_at;
    activities.push({
      id: latest.id,
      title,
      description: 'event created',
      timeLabel: formatRelativeTime(ts),
      avatar:
        latest.data?.image ||
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200',
      timestamp: ts ? new Date(ts).getTime() : 0,
    });
  }

  if (announcementDocsAny.length) {
    const sorted = [...announcementDocsAny].sort((a, b) => {
      const aTs = a.data?.createdAt ?? a.created_at;
      const bTs = b.data?.createdAt ?? b.created_at;
      return new Date(bTs).getTime() - new Date(aTs).getTime();
    });
    const latest = sorted[0];
    const authorName = latest.data?.authorName || 'You';
    const ts = latest.data?.createdAt ?? latest.created_at;
    activities.push({
      id: latest.id,
      title: authorName,
      description: 'posted a new announcement',
      timeLabel: formatRelativeTime(ts),
      avatar:
        latest.data?.authorAvatar ||
        'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
      timestamp: ts ? new Date(ts).getTime() : 0,
    });
  }

  const recentActivities = activities.sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
        <p className="text-muted-foreground">Here's what's happening with your community today.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card p-6 hover:neon-glow-cyan transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-green-500 font-medium">{stat.change}</span>
                </div>
                <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Activity</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-neon-cyan rounded-full pulse-glow"></div>
              <span className="text-sm text-muted-foreground">Live</span>
            </div>
          </div>

          <div className="space-y-4">
            {recentActivities.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No recent activity yet. Once you add members, events, or announcements, they will appear here.
              </p>
            )}
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center space-x-4 p-4 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <img
                  src={activity.avatar}
                  alt={activity.title}
                  className="w-12 h-12 rounded-full ring-2 ring-primary/20"
                />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.title}</span>{' '}
                    <span className="text-muted-foreground">{activity.description}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.timeLabel}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions (Admins only) */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card 
            className="glass-card p-6 hover:neon-glow-cyan transition-all cursor-pointer hover:scale-105"
            onClick={() => navigate('/events')}
          >
            <h3 className="text-xl font-semibold mb-2">Create Event</h3>
            <p className="text-muted-foreground text-sm">Plan your next community gathering</p>
          </Card>
          <Card 
            className="glass-card p-6 hover:neon-glow-cyan transition-all cursor-pointer hover:scale-105"
            onClick={() => navigate('/announcements')}
          >
            <h3 className="text-xl font-semibold mb-2">Send Announcement</h3>
            <p className="text-muted-foreground text-sm">Keep everyone in the loop</p>
          </Card>
          <Card 
            className="glass-card p-6 hover:neon-glow-cyan transition-all cursor-pointer hover:scale-105"
            onClick={() => navigate('/stats')}
          >
            <h3 className="text-xl font-semibold mb-2">View Reports</h3>
            <p className="text-muted-foreground text-sm">Analyze community metrics</p>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
