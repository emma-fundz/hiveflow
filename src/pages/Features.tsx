import { motion } from 'framer-motion';
import { Users, Calendar, Megaphone, FileText, BarChart, Smartphone, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const features = [
  {
    icon: Users,
    title: 'Member Management',
    description: 'Effortlessly manage your community roster with searchable tables, detailed profiles, and role-based permissions.',
    color: 'from-neon-cyan to-blue-500'
  },
  {
    icon: Calendar,
    title: 'Events & RSVP',
    description: 'Plan stunning events with countdown timers, location tracking, and real-time RSVP management.',
    color: 'from-neon-indigo to-purple-500'
  },
  {
    icon: Megaphone,
    title: 'Announcements Feed',
    description: 'Keep everyone informed with a beautiful infinite scroll feed, reactions, and engagement tracking.',
    color: 'from-pink-500 to-rose-500'
  },
  {
    icon: FileText,
    title: 'File Sharing',
    description: 'Drag-and-drop file uploads with beautiful previews, organized storage, and instant downloads.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: BarChart,
    title: 'Analytics & Reports',
    description: 'Track member growth, event attendance, and engagement with interactive charts and key insights.',
    color: 'from-orange-500 to-amber-500'
  },
  {
    icon: Smartphone,
    title: 'Multi-device Experience',
    description: 'Fully responsive design that looks gorgeous on desktop, tablet, and mobile devices.',
    color: 'from-cyan-500 to-teal-500'
  }
];

const Features = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Why Communities{' '}
              <span className="bg-gradient-to-r from-neon-cyan to-neon-indigo bg-clip-text text-transparent">
                Love This Platform
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Everything you need to build, manage, and grow thriving communities in one beautiful, intuitive platform.
            </p>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-card p-8 hover:neon-glow-cyan transition-all h-full group cursor-pointer">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Additional Features */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Built for Performance & Security</h2>
            <p className="text-muted-foreground text-lg">
              Enterprise-grade features with beautiful design
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="glass-card p-8">
                <Shield className="w-12 h-12 text-neon-cyan mb-4" />
                <h3 className="text-2xl font-bold mb-3">Security First</h3>
                <p className="text-muted-foreground">
                  Role-based permissions, secure authentication, and data encryption keep your community safe.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="glass-card p-8">
                <Zap className="w-12 h-12 text-neon-indigo mb-4" />
                <h3 className="text-2xl font-bold mb-3">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Optimized performance with lazy loading, code splitting, and smooth animations for instant responsiveness.
                </p>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-center"
          >
            <Card className="glass-card p-12 max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">
                Ready to Transform Your Community?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Join thousands of community leaders using ClubManager to build engaged, thriving communities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button className="bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90 px-8 py-6 text-lg">
                    Sign Up Free
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" className="px-8 py-6 text-lg">
                    Explore Dashboard
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Features;
