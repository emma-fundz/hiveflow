import { motion } from 'framer-motion';
import { TrendingUp, Users, Calendar, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const memberGrowthData = [
  { month: 'Jan', members: 1200 },
  { month: 'Feb', members: 1450 },
  { month: 'Mar', members: 1800 },
  { month: 'Apr', members: 2100 },
  { month: 'May', members: 2350 },
  { month: 'Jun', members: 2450 },
];

const eventAttendanceData = [
  { name: 'Week 1', attendance: 65 },
  { name: 'Week 2', attendance: 78 },
  { name: 'Week 3', attendance: 92 },
  { name: 'Week 4', attendance: 85 },
];

const memberActivityData = [
  { name: 'Active', value: 892, color: '#06b6d4' },
  { name: 'Inactive', value: 458, color: '#6366f1' },
  { name: 'New', value: 1100, color: '#8b5cf6' },
];

const Analytics = () => {
  const stats = [
    { label: 'Total Members', value: '2,450', change: '+12.5%', icon: Users, color: 'from-neon-cyan to-blue-500' },
    { label: 'Monthly Growth', value: '34%', change: '+5.2%', icon: TrendingUp, color: 'from-neon-indigo to-purple-500' },
    { label: 'Events This Month', value: '24', change: '+8%', icon: Calendar, color: 'from-pink-500 to-rose-500' },
    { label: 'Engagement Rate', value: '78%', change: '+15%', icon: Activity, color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">Track your community's performance</p>
      </div>

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
              <h3 className="font-semibold mb-2">Growing Fast</h3>
              <p className="text-sm text-muted-foreground">
                Your community has grown by 34% this month, surpassing your target by 9%
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-neon-indigo mb-2">⭐</div>
              <h3 className="font-semibold mb-2">High Engagement</h3>
              <p className="text-sm text-muted-foreground">
                78% engagement rate shows your members are highly active and involved
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-500 mb-2">📈</div>
              <h3 className="font-semibold mb-2">Event Success</h3>
              <p className="text-sm text-muted-foreground">
                Average event attendance increased by 23% compared to last month
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Analytics;
