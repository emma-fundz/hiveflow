import { motion } from 'framer-motion';
import { Users, Target, Zap, Heart, Linkedin, Twitter, Github } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const values = [
  {
    icon: Users,
    title: 'Community First',
    description: 'We believe strong communities make the world better. Every feature we build puts community needs first.',
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'We push boundaries with cutting-edge design and technology to deliver the best experience possible.',
  },
  {
    icon: Target,
    title: 'Simplicity',
    description: 'Complex problems deserve simple solutions. We make community management effortless and intuitive.',
  },
  {
    icon: Heart,
    title: 'Care',
    description: 'We genuinely care about every community we serve and are committed to their success.',
  },
];

const team = [
  {
    name: 'Sarah Chen',
    role: 'Co-Founder & CEO',
    image: '/placeholder.svg',
    bio: 'Former community lead at major tech companies with 10+ years of experience building engaged communities.',
    social: { twitter: '#', linkedin: '#', github: '#' },
  },
  {
    name: 'Marcus Johnson',
    role: 'Co-Founder & CTO',
    image: '/placeholder.svg',
    bio: 'Full-stack engineer passionate about building beautiful, performant applications that scale.',
    social: { twitter: '#', linkedin: '#', github: '#' },
  },
  {
    name: 'Emma Rodriguez',
    role: 'Head of Design',
    image: '/placeholder.svg',
    bio: 'Award-winning designer specializing in futuristic UI/UX with a focus on accessibility.',
    social: { twitter: '#', linkedin: '#', github: '#' },
  },
  {
    name: 'David Kim',
    role: 'Head of Engineering',
    image: '/placeholder.svg',
    bio: 'Software architect with expertise in distributed systems and real-time applications.',
    social: { twitter: '#', linkedin: '#', github: '#' },
  },
];

const stats = [
  { label: 'Communities Served', value: '2,500+' },
  { label: 'Active Members', value: '150K+' },
  { label: 'Events Created', value: '25K+' },
  { label: 'Satisfaction Rate', value: '98%' },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-radial"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-neon-cyan/20 rounded-full blur-3xl float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-indigo/20 rounded-full blur-3xl float" style={{ animationDelay: '2s' }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              We're Building The
              <span className="block bg-gradient-to-r from-neon-cyan to-neon-indigo bg-clip-text text-transparent">
                Future of Community
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              ClubManager was born from a simple idea: managing communities should be beautiful, intuitive, and powerful. We're on a mission to empower community leaders with the best tools possible.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-20"
          >
            {stats.map((stat, index) => (
              <Card key={index} className="glass-card text-center hover:scale-105 transition-transform">
                <CardContent className="pt-6">
                  <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-neon-cyan to-neon-indigo bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </p>
                  <p className="text-sm md:text-base text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Mission Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-20"
          >
            <Card className="glass-card border-neon-cyan">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Our Mission</h2>
                <p className="text-lg md:text-xl text-muted-foreground text-center leading-relaxed">
                  To democratize community management by providing powerful, beautiful, and accessible tools that help leaders build stronger, more engaged communities. We believe every community deserves world-class management software, regardless of size or budget.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-card h-full hover:scale-105 transition-transform">
                      <CardHeader>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-indigo flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6 text-background" />
                        </div>
                        <CardTitle className="text-xl">{value.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm md:text-base text-muted-foreground">{value.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Team */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Meet Our Team</h2>
            <p className="text-lg md:text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              We're a diverse group of designers, engineers, and community experts passionate about building great products.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-card hover:scale-105 transition-transform">
                    <CardHeader className="text-center">
                      <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-primary">
                        <AvatarImage src={member.image} />
                        <AvatarFallback className="text-2xl bg-gradient-to-br from-neon-cyan to-neon-indigo text-background">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-xl">{member.name}</CardTitle>
                      <CardDescription className="text-neon-cyan font-medium">{member.role}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">{member.bio}</p>
                      <div className="flex items-center justify-center space-x-3">
                        <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                          <Twitter className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                          <Linkedin className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                          <Github className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
