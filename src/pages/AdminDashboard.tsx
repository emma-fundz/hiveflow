import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Calendar, FileText, Megaphone, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// Admin email - only this email has access
const ADMIN_EMAIL = 'admin@clubmanager.com';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication and admin status
    if (!isAuthenticated || user?.email !== ADMIN_EMAIL) {
      navigate('/404');
    }
  }, [isAuthenticated, user, navigate]);

  // Mock admin data
  const stats = [
    { label: 'Total Users', value: '2,450', change: '+12%', icon: Users, color: 'from-neon-cyan to-blue-500' },
    { label: 'Active Users', value: '1,892', change: '+18%', icon: Activity, color: 'from-green-500 to-emerald-500' },
    { label: 'Total Events', value: '127', change: '+8%', icon: Calendar, color: 'from-neon-indigo to-purple-500' },
    { label: 'Total Files', value: '3,240', change: '+23%', icon: FileText, color: 'from-orange-500 to-amber-500' },
    { label: 'Announcements', value: '456', change: '+15%', icon: Megaphone, color: 'from-pink-500 to-rose-500' },
    { label: 'Growth Rate', value: '34%', change: '+5%', icon: TrendingUp, color: 'from-cyan-500 to-teal-500' },
  ];

  const userGrowthData = [
    { month: 'Jan', users: 1200 },
    { month: 'Feb', users: 1450 },
    { month: 'Mar', users: 1680 },
    { month: 'Apr', users: 1920 },
    { month: 'May', users: 2180 },
    { month: 'Jun', users: 2450 },
  ];

  const activityData = [
    { name: 'Active', value: 1892 },
    { name: 'Inactive', value: 558 },
  ];

  const COLORS = ['hsl(189, 94%, 43%)', 'hsl(222, 47%, 15%)'];

  const recentActivity = [
    { user: 'New user registration', action: 'sarah@example.com', time: '2 minutes ago', type: 'user' },
    { user: 'Event created', action: 'Summer Meetup 2025', time: '15 minutes ago', type: 'event' },
    { user: 'File uploaded', action: 'Q1_Report.pdf (2.4MB)', time: '32 minutes ago', type: 'file' },
    { user: 'Announcement posted', action: 'Platform Update v2.1', time: '1 hour ago', type: 'announcement' },
    { user: 'User deactivated', action: 'john@example.com', time: '2 hours ago', type: 'warning' },
  ];

  // If not admin, don't render anything (will redirect)
  if (!isAuthenticated || user?.email !== ADMIN_EMAIL) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header with Warning */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">System-wide analytics and management</p>
          </div>
          <Card className="glass-card p-4 border-orange-500/50">
            <div className="flex items-center space-x-2 text-orange-500">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Admin Access Only</span>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-6">User Growth (6 Months)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 15%)" />
                <XAxis dataKey="month" stroke="hsl(215, 20.2%, 65.1%)" />
                <YAxis stroke="hsl(215, 20.2%, 65.1%)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 6%)',
                    border: '1px solid hsl(189, 94%, 43%, 0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="users" stroke="hsl(189, 94%, 43%)" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* User Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-6">User Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={activityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 6%)',
                    border: '1px solid hsl(189, 94%, 43%, 0.2)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Recent System Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent System Activity</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-neon-cyan rounded-full pulse-glow"></div>
              <span className="text-sm text-muted-foreground">Live</span>
            </div>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.user}</p>
                  <p className="text-xs text-muted-foreground">{activity.action}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
