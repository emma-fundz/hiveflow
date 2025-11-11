import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Sparkles, MessageSquare } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const roadmapItems = [
  {
    status: 'completed',
    title: 'Core Platform Launch',
    description: 'Beautiful glassmorphic UI with member management, events, announcements, and file sharing',
    quarter: 'Q4 2024',
    features: [
      'Member management system',
      'Event planning and RSVP tracking',
      'Announcements feed',
      'File storage and sharing',
      'Analytics dashboard',
      'Mobile responsive design',
    ],
  },
  {
    status: 'completed',
    title: 'Enhanced User Experience',
    description: 'Improved navigation, animations, and accessibility features',
    quarter: 'Q1 2025',
    features: [
      'Advanced animations and transitions',
      'Dark/light theme support',
      'Keyboard navigation',
      'Screen reader optimization',
      'Performance improvements',
    ],
  },
  {
    status: 'in-progress',
    title: 'Communication Suite',
    description: 'Real-time messaging and enhanced collaboration tools',
    quarter: 'Q2 2025',
    features: [
      'Direct messaging between members',
      'Group chat channels',
      'Video call integration',
      'Voice messaging',
      'Rich media sharing',
      'Read receipts and typing indicators',
    ],
  },
  {
    status: 'in-progress',
    title: 'Advanced Analytics',
    description: 'Deeper insights into community engagement and growth',
    quarter: 'Q2 2025',
    features: [
      'Member engagement scoring',
      'Event attendance predictions',
      'Community health metrics',
      'Custom report builder',
      'Export to PDF/Excel',
      'Goal tracking and benchmarks',
    ],
  },
  {
    status: 'planned',
    title: 'Automation & Workflows',
    description: 'Smart automation to save time and improve efficiency',
    quarter: 'Q3 2025',
    features: [
      'Automated welcome messages',
      'Event reminder automation',
      'Member milestone celebrations',
      'Custom workflow builder',
      'Integration with Zapier',
      'Scheduled announcements',
    ],
  },
  {
    status: 'planned',
    title: 'Mobile Apps',
    description: 'Native iOS and Android applications',
    quarter: 'Q3 2025',
    features: [
      'Native mobile experience',
      'Push notifications',
      'Offline mode',
      'Camera integration for events',
      'Location-based features',
      'QR code check-ins',
    ],
  },
  {
    status: 'planned',
    title: 'Community Marketplace',
    description: 'Enable buying/selling and fundraising within your community',
    quarter: 'Q4 2025',
    features: [
      'Member marketplace',
      'Fundraising campaigns',
      'Event ticketing',
      'Merchandise store',
      'Payment processing',
      'Donation tracking',
    ],
  },
  {
    status: 'planned',
    title: 'AI-Powered Features',
    description: 'Intelligent features to enhance community management',
    quarter: 'Q4 2025',
    features: [
      'AI content moderation',
      'Smart event recommendations',
      'Automated content suggestions',
      'Sentiment analysis',
      'Chatbot assistant',
      'Auto-translation for global communities',
    ],
  },
];

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    color: 'text-neon-cyan',
    bgColor: 'bg-neon-cyan/20',
    borderColor: 'border-neon-cyan/40',
  },
  'in-progress': {
    icon: Clock,
    label: 'In Progress',
    color: 'text-neon-indigo',
    bgColor: 'bg-neon-indigo/20',
    borderColor: 'border-neon-indigo/40',
  },
  planned: {
    icon: Sparkles,
    label: 'Coming Soon',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/20',
    borderColor: 'border-muted/40',
  },
};

const Roadmap = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-radial"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-neon-cyan/20 rounded-full blur-3xl float"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Building The
              <span className="block bg-gradient-to-r from-neon-cyan to-neon-indigo bg-clip-text text-transparent">
                Future of Communities
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              See what we're working on and what's coming next. Your feedback shapes our roadmap.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90">
              <MessageSquare className="mr-2 w-5 h-5" />
              Suggest a Feature
            </Button>
          </motion.div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-12">
            {Object.entries(statusConfig).map(([status, config]) => {
              const Icon = config.icon;
              return (
                <div key={status} className="flex items-center space-x-2">
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <span className="text-sm md:text-base">{config.label}</span>
                </div>
              );
            })}
          </div>

          {/* Timeline */}
          <div className="max-w-5xl mx-auto space-y-8">
            {roadmapItems.map((item, index) => {
              const config = statusConfig[item.status as keyof typeof statusConfig];
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card className={`glass-card border-l-4 ${config.borderColor} hover:scale-[1.02] transition-transform`}>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center flex-shrink-0 mt-1`}>
                            <Icon className={`w-5 h-5 ${config.color}`} />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-xl md:text-2xl mb-2">{item.title}</CardTitle>
                            <CardDescription className="text-sm md:text-base">{item.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className={`${config.bgColor} ${config.color} border-0 whitespace-nowrap self-start`}>
                          {item.quarter}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                        {item.features.map((feature, i) => (
                          <div key={i} className="flex items-start space-x-2">
                            <CheckCircle2 className={`w-4 h-4 ${config.color} flex-shrink-0 mt-0.5`} />
                            <span className="text-sm md:text-base text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 glass-card p-8 md:p-12 rounded-3xl text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Help Shape Our Future</h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              We're building ClubManager with your input. Share your ideas and help us prioritize the features that matter most to you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90">
                <MessageSquare className="mr-2 w-5 h-5" />
                Share Your Ideas
              </Button>
              <Button size="lg" variant="outline" className="glass border-glass-border">
                Join Beta Testing
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Roadmap;
