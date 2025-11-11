import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, ChevronDown, Heart, Code, Palette, BarChart, Users } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

const perks = [
  {
    icon: Heart,
    title: 'Health & Wellness',
    description: 'Comprehensive medical, dental, and vision coverage for you and your family',
  },
  {
    icon: Clock,
    title: 'Flexible Hours',
    description: 'Work when you\'re most productive with our flexible schedule policy',
  },
  {
    icon: MapPin,
    title: 'Remote First',
    description: 'Work from anywhere with optional office space in major cities',
  },
  {
    icon: Code,
    title: 'Learning Budget',
    description: '$2,000 annual budget for courses, conferences, and professional development',
  },
];

const openings = [
  {
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    icon: Code,
    description: 'Build the future of community management software with cutting-edge technology.',
    responsibilities: [
      'Design and implement scalable features across our full stack',
      'Collaborate with product and design teams to deliver exceptional user experiences',
      'Mentor junior engineers and contribute to technical decision-making',
      'Optimize application performance and ensure code quality',
    ],
    requirements: [
      '5+ years of experience with React, TypeScript, and Node.js',
      'Strong understanding of database design and API development',
      'Experience with cloud platforms (AWS, GCP, or Azure)',
      'Excellent problem-solving and communication skills',
    ],
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    icon: Palette,
    description: 'Create beautiful, intuitive experiences that delight our users.',
    responsibilities: [
      'Design end-to-end user experiences for new and existing features',
      'Create high-fidelity mockups, prototypes, and design systems',
      'Conduct user research and usability testing',
      'Collaborate closely with engineering to ensure pixel-perfect implementations',
    ],
    requirements: [
      '4+ years of product design experience',
      'Strong portfolio showcasing UI/UX work',
      'Proficiency in Figma and modern design tools',
      'Understanding of accessibility and responsive design principles',
    ],
  },
  {
    title: 'Community Success Manager',
    department: 'Customer Success',
    location: 'Remote',
    type: 'Full-time',
    icon: Users,
    description: 'Help our customers build thriving communities and achieve their goals.',
    responsibilities: [
      'Onboard new customers and ensure successful adoption',
      'Build strong relationships with community managers',
      'Identify opportunities for account growth and expansion',
      'Gather customer feedback and advocate for product improvements',
    ],
    requirements: [
      '3+ years in customer success or community management',
      'Excellent communication and relationship-building skills',
      'Experience with SaaS products and analytics tools',
      'Passion for helping communities succeed',
    ],
  },
  {
    title: 'Data Analyst',
    department: 'Analytics',
    location: 'Remote',
    type: 'Full-time',
    icon: BarChart,
    description: 'Turn data into insights that drive product and business decisions.',
    responsibilities: [
      'Analyze user behavior and community engagement metrics',
      'Build dashboards and reports for internal stakeholders',
      'Conduct A/B tests and measure feature impact',
      'Identify trends and opportunities for optimization',
    ],
    requirements: [
      '3+ years of experience in data analysis',
      'Proficiency in SQL and data visualization tools',
      'Strong statistical knowledge and analytical thinking',
      'Experience with product analytics platforms',
    ],
  },
  {
    title: 'Marketing Manager',
    department: 'Marketing',
    location: 'Remote / Hybrid',
    type: 'Full-time',
    icon: Briefcase,
    description: 'Drive growth and tell our story to community builders everywhere.',
    responsibilities: [
      'Develop and execute marketing campaigns across multiple channels',
      'Create compelling content that resonates with our target audience',
      'Manage our social media presence and community engagement',
      'Analyze campaign performance and optimize for ROI',
    ],
    requirements: [
      '4+ years of marketing experience, preferably in B2B SaaS',
      'Strong writing and storytelling skills',
      'Experience with marketing automation and analytics tools',
      'Creative mindset with data-driven decision making',
    ],
  },
  {
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    icon: Code,
    description: 'Build and maintain the infrastructure that powers millions of community interactions.',
    responsibilities: [
      'Design and manage cloud infrastructure and deployment pipelines',
      'Implement monitoring, logging, and alerting systems',
      'Optimize system performance and ensure high availability',
      'Collaborate with development teams on infrastructure needs',
    ],
    requirements: [
      '4+ years of DevOps or infrastructure engineering experience',
      'Strong knowledge of AWS/GCP, Docker, Kubernetes',
      'Experience with CI/CD tools and infrastructure as code',
      'Excellent troubleshooting and problem-solving skills',
    ],
  },
];

const Careers = () => {
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
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Join Our
              <span className="block bg-gradient-to-r from-neon-cyan to-neon-indigo bg-clip-text text-transparent">
                Mission
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              We're building the future of community management. Join a team that's passionate about empowering community leaders worldwide.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90">
              View Open Positions
            </Button>
          </motion.div>

          {/* Why Join Us */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Why ClubManager?</h2>
            <p className="text-lg md:text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              We offer more than just a job. Join a team that values growth, innovation, and work-life balance.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {perks.map((perk, index) => {
                const Icon = perk.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-card h-full hover:scale-105 transition-transform">
                      <CardHeader>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-indigo flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6 text-background" />
                        </div>
                        <CardTitle className="text-lg md:text-xl">{perk.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm md:text-base text-muted-foreground">{perk.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Open Positions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Open Positions</h2>
            <p className="text-lg md:text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Find your next opportunity and help us build something amazing.
            </p>
            <div className="max-w-4xl mx-auto space-y-4">
              {openings.map((job, index) => (
                <JobListing key={index} job={job} index={index} />
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 glass-card p-8 md:p-12 rounded-3xl text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Don't See Your Role?</h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              We're always looking for talented people. Send us your resume and tell us why you'd be a great fit.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90">
              Send Us Your Resume
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const JobListing = ({ job, index }: { job: any; index: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = job.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="glass-card overflow-hidden">
          <CollapsibleTrigger className="w-full text-left hover:bg-muted/30 transition-colors">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-indigo flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-background" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg md:text-xl mb-2">{job.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="outline" className="bg-neon-cyan/20 text-neon-cyan border-0">
                        {job.department}
                      </Badge>
                      <Badge variant="outline" className="bg-muted/50 border-0">
                        <MapPin className="w-3 h-3 mr-1" /> {job.location}
                      </Badge>
                      <Badge variant="outline" className="bg-muted/50 border-0">
                        <Clock className="w-3 h-3 mr-1" /> {job.type}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm md:text-base">{job.description}</CardDescription>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform mt-1 ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-0 space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-base md:text-lg">Responsibilities</h4>
                <ul className="space-y-2">
                  {job.responsibilities.map((item: string, i: number) => (
                    <li key={i} className="flex items-start space-x-2 text-sm md:text-base text-muted-foreground">
                      <span className="text-neon-cyan mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-base md:text-lg">Requirements</h4>
                <ul className="space-y-2">
                  {job.requirements.map((item: string, i: number) => (
                    <li key={i} className="flex items-start space-x-2 text-sm md:text-base text-muted-foreground">
                      <span className="text-neon-cyan mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90">
                Apply Now
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </motion.div>
  );
};

export default Careers;
