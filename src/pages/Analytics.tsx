import { motion } from 'framer-motion';
import { TrendingUp, Users, Calendar, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import db from '@/lib/cocobase';
import { useQuery } from '@tanstack/react-query';

const Analytics = () => {
  const { user } = useAuth();
  const workspaceId = (user as any)?.workspaceId ?? (user as any)?.id;
  const userRole = (user as any)?.role as string | undefined;
  const isOwner = !(user as any)?.workspaceId;
  const isAdmin = userRole === 'Admin' || isOwner;

  const { data: memberDocs = [], isLoading: membersLoading } = useQuery({
    queryKey: ['analytics-members', workspaceId],
    queryFn: async () => {
      if (!workspaceId || !isAdmin) return [];
      const docs = await db.listDocuments('members', {
        filters: { ownerId: workspaceId },
      });
      return docs as any[];
    },
    enabled: !!workspaceId && isAdmin,
  });

  const { data: eventDocs = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['analytics-events', workspaceId],
    queryFn: async () => {
      if (!workspaceId || !isAdmin) return [];
      const docs = await db.listDocuments('events', {
        filters: { ownerId: workspaceId },
      });
      return docs as any[];
    },
    enabled: !!workspaceId && isAdmin,
  });

  const { data: announcementDocs = [], isLoading: announcementsLoading } = useQuery({
    queryKey: ['analytics-announcements', workspaceId],
    queryFn: async () => {
      if (!workspaceId || !isAdmin) return [];
      const docs = await db.listDocuments('announcements', {
        filters: { ownerId: workspaceId },
      });
      return docs as any[];
    },
    enabled: !!workspaceId && isAdmin,
  });

  const numberFormatter = new Intl.NumberFormat();

  const memberCount = memberDocs.length;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const joinedThisMonth = memberDocs.filter((doc: any) => {
    const ts = doc.data?.joinedAt ?? doc.created_at;
    if (!ts) return false;
    const d = new Date(ts);
    return d >= startOfMonth;
  }).length;

  const joinedLastMonth = memberDocs.filter((doc: any) => {
    const ts = doc.data?.joinedAt ?? doc.created_at;
    if (!ts) return false;
    const d = new Date(ts);
    return d >= startOfPrevMonth && d < startOfMonth;
  }).length;

  const monthlyGrowth = joinedLastMonth
    ? ((joinedThisMonth - joinedLastMonth) / Math.max(joinedLastMonth, 1)) * 100
    : joinedThisMonth
    ? 100
    : 0;

  const eventsThisMonth = eventDocs.filter((doc: any) => {
    const date = doc.data?.date;
    if (!date) return false;
    const time = doc.data?.time || '00:00';
    const d = new Date(`${date}T${time}`);
    return d >= startOfMonth && d <= now;
  }).length;

  const totalLikes = announcementDocs.reduce((sum: number, doc: any) => {
    return sum + (doc.data?.likes ?? 0);
  }, 0);

  const engagementRate = memberCount
    ? Math.min(100, (totalLikes / Math.max(memberCount, 1)) * 10)
    : 0;

  const stats = [
    {
      label: 'Total Members',
      value: numberFormatter.format(memberCount),
      change: '--',
      icon: Users,
      color: 'from-neon-cyan to-blue-500',
    },
    {
      label: 'Monthly Growth',
      value: `${monthlyGrowth.toFixed(1)}%`,
      change: joinedThisMonth ? `+${joinedThisMonth} new` : '--',
      icon: TrendingUp,
      color: 'from-neon-indigo to-purple-500',
    },
    {
      label: 'Events This Month',
      value: numberFormatter.format(eventsThisMonth),
      change: '--',
      icon: Calendar,
      color: 'from-pink-500 to-rose-500',
    },
    {
      label: 'Engagement Rate',
      value: `${engagementRate.toFixed(0)}%`,
      change: '--',
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const buildMemberGrowthData = () => {
    const data: { month: string; members: number }[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString(undefined, { month: 'short' });
      const count = memberDocs.filter((doc: any) => {
        const ts = doc.data?.joinedAt ?? doc.created_at;
        if (!ts) return false;
        const joinDate = new Date(ts);
        return (
          joinDate.getFullYear() === d.getFullYear() &&
          joinDate.getMonth() === d.getMonth()
        );
      }).length;
      data.push({ month: monthLabel, members: count });
    }
    return data;
  };

  const memberGrowthData = buildMemberGrowthData();

  const recentEvents = [...eventDocs]
    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-4);

  const eventAttendanceData = recentEvents.map((doc: any, index: number) => ({
    name: doc.data?.title || `Event ${recentEvents.length - index}`,
    attendance: doc.data?.attendees ?? 0,
  }));

  const activeCount = memberDocs.filter((doc: any) => doc.data?.status === 'active').length;
  const inactiveCount = Math.max(memberCount - activeCount, 0);
  const newCount = joinedThisMonth;

  const memberActivityData = [
    { name: 'Active', value: activeCount, color: '#06b6d4' },
    { name: 'Inactive', value: inactiveCount, color: '#6366f1' },
    { name: 'New this month', value: newCount, color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">Track your community's performance</p>
      </div>

      {!isAdmin && (
        <Card className="glass-card p-6">
          <p className="text-sm text-muted-foreground">
            Analytics are only available to workspace admins.
          </p>
        </Card>
      )}

      {isAdmin && (membersLoading || eventsLoading || announcementsLoading) && (
        <p className="text-sm text-muted-foreground">Loading analytics...</p>
      )}

      {isAdmin && (
        <>
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
                  <Card className="glass-card p-6 hover:neon-glow-cyan transition-shadow">
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

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Growth Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-6">Member Growth</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={memberGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="members"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Event Attendance Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-6">Event Attendance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="attendance" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Member Activity Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-6">Member Activity Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={memberActivityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {memberActivityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

          {/* Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="glass-card p-6">
              <h2 className="text-2xl font-bold mb-4">Key Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-neon-cyan mb-2">🚀</div>
                  <h3 className="font-semibold mb-2">Member Growth</h3>
                  <p className="text-sm text-muted-foreground">
                    You gained {joinedThisMonth} new member{joinedThisMonth === 1 ? '' : 's'} this month.
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-neon-indigo mb-2">⭐</div>
                  <h3 className="font-semibold mb-2">Engagement</h3>
                  <p className="text-sm text-muted-foreground">
                    Total announcement likes: {totalLikes}. Estimated engagement rate {engagementRate.toFixed(0)}%.
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-500 mb-2">📈</div>
                  <h3 className="font-semibold mb-2">Events</h3>
                  <p className="text-sm text-muted-foreground">
                    {eventsThisMonth} event{eventsThisMonth === 1 ? '' : 's'} scheduled this month.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Analytics;
