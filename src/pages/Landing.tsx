import { motion } from 'framer-motion';
import { Users, Calendar, Megaphone, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FeatureCard } from '@/components/FeatureCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 gradient-radial"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-neon-cyan/20 rounded-full blur-3xl float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-indigo/20 rounded-full blur-3xl float" style={{ animationDelay: '2s' }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Manage Your
              <span className="block bg-gradient-to-r from-neon-cyan via-neon-indigo to-neon-cyan bg-clip-text text-transparent animated-gradient">
                Community in One Tap
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The most beautiful and powerful community management platform. Built for the future.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90 text-lg px-8 neon-glow-cyan">
                  Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 glass border-glass-border hover:bg-muted">
                  Explore Demo
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Live Preview Widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20 max-w-5xl mx-auto"
          >
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Live Activity Feed</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-neon-cyan rounded-full pulse-glow"></div>
                  <span className="text-sm text-muted-foreground">Live</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { user: 'Sarah Chen', action: 'joined the community', time: '2m ago' },
                  { user: 'Mike Johnson', action: 'created a new event', time: '5m ago' },
                  { user: 'Emma Wilson', action: 'posted an announcement', time: '8m ago' },
                ].map((activity, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-indigo"></div>
                    <div className="flex-1">
                      <p className="text-sm"><span className="font-medium">{activity.user}</span> {activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg">Powerful features wrapped in a beautiful interface</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Users}
              title="Member Management"
              description="Track and organize your community members with ease"
              delay={0}
            />
            <FeatureCard
              icon={Calendar}
              title="Event Planning"
              description="Create and manage events with RSVP tracking"
              delay={0.1}
            />
            <FeatureCard
              icon={Megaphone}
              title="Announcements"
              description="Keep everyone informed with instant updates"
              delay={0.2}
            />
            <FeatureCard
              icon={FileText}
              title="File Sharing"
              description="Upload and share files securely with your team"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-radial opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">Built for Modern Communities</h2>
              <div className="space-y-4">
                {[
                  'Real-time updates and notifications',
                  'Beautiful glassmorphic UI design',
                  'Mobile-first responsive layout',
                  'Intuitive user experience',
                  'Powerful analytics dashboard',
                  'Secure file storage',
                ].map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle2 className="w-6 h-6 text-neon-cyan flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-3xl"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">2,450</p>
                    <p className="text-muted-foreground">Active Members</p>
                  </div>
                  <Users className="w-12 h-12 text-neon-cyan" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">127</p>
                    <p className="text-muted-foreground">Upcoming Events</p>
                  </div>
                  <Calendar className="w-12 h-12 text-neon-indigo" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">98%</p>
                    <p className="text-muted-foreground">Satisfaction Rate</p>
                  </div>
                  <CheckCircle2 className="w-12 h-12 text-neon-cyan" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 rounded-3xl text-center max-w-4xl mx-auto neon-glow-cyan"
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Community?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of communities already using ClubManager
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90 text-lg px-8">
                  Start Free Trial
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 glass border-glass-border">
                Schedule Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
