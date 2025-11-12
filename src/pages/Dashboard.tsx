import { motion } from 'framer-motion';
import { Users, Calendar, TrendingUp, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Members', value: '2,450', change: '+12%', icon: Users, color: 'from-neon-cyan to-blue-500' },
    { label: 'Upcoming Events', value: '127', change: '+8%', icon: Calendar, color: 'from-neon-indigo to-purple-500' },
    { label: 'Active Today', value: '892', change: '+23%', icon: Activity, color: 'from-pink-500 to-rose-500' },
    { label: 'Growth Rate', value: '34%', change: '+5%', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
  ];

  const recentActivities = [
    { user: 'Sarah Chen', action: 'joined the community', time: '2 minutes ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { user: 'Mike Johnson', action: 'created "Summer Meetup" event', time: '5 minutes ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
    { user: 'Emma Wilson', action: 'posted a new announcement', time: '8 minutes ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
    { user: 'James Brown', action: 'uploaded 3 files', time: '12 minutes ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James' },
  ];

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
            {recentActivities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center space-x-4 p-4 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <img
                  src={activity.avatar}
                  alt={activity.user}
                  className="w-12 h-12 rounded-full ring-2 ring-primary/20"
                />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{' '}
                    <span className="text-muted-foreground">{activity.action}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card 
          className="glass-card p-6 hover:neon-glow-cyan transition-all cursor-pointer hover:scale-105"
          onClick={() => window.location.href = '/events'}
        >
          <h3 className="text-xl font-semibold mb-2">Create Event</h3>
          <p className="text-muted-foreground text-sm">Plan your next community gathering</p>
        </Card>
        <Card 
          className="glass-card p-6 hover:neon-glow-cyan transition-all cursor-pointer hover:scale-105"
          onClick={() => window.location.href = '/announcements'}
        >
          <h3 className="text-xl font-semibold mb-2">Send Announcement</h3>
          <p className="text-muted-foreground text-sm">Keep everyone in the loop</p>
        </Card>
        <Card 
          className="glass-card p-6 hover:neon-glow-cyan transition-all cursor-pointer hover:scale-105"
          onClick={() => window.location.href = '/stats'}
        >
          <h3 className="text-xl font-semibold mb-2">View Reports</h3>
          <p className="text-muted-foreground text-sm">Analyze community metrics</p>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
