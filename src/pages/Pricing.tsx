import { motion } from 'framer-motion';
import { Check, Zap, Rocket, Building2, ArrowRight, ChevronDown } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const tiers = [
  {
    name: 'Free',
    icon: Zap,
    price: '$0',
    period: 'forever',
    description: 'Perfect for small communities getting started',
    features: [
      'Up to 50 members',
      '5 events per month',
      'Basic announcements',
      '1GB file storage',
      'Community analytics',
      'Email support',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    icon: Rocket,
    price: '$29',
    period: 'per month',
    description: 'For growing communities with advanced needs',
    features: [
      'Unlimited members',
      'Unlimited events',
      'Advanced announcements',
      '50GB file storage',
      'Advanced analytics & insights',
      'Priority support',
      'Custom branding',
      'Integrations & API access',
      'Team collaboration tools',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    icon: Building2,
    price: 'Custom',
    period: 'contact sales',
    description: 'For large organizations with custom requirements',
    features: [
      'Everything in Pro',
      'Unlimited storage',
      'Dedicated account manager',
      '24/7 phone support',
      'Custom integrations',
      'SLA guarantee',
      'On-premise deployment option',
      'Advanced security features',
      'Training & onboarding',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

const faqs = [
  {
    question: 'Can I switch plans at any time?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle, and we\'ll prorate any differences.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for Enterprise plans.',
  },
  {
    question: 'Is there a free trial for paid plans?',
    answer: 'Yes! We offer a 14-day free trial for the Pro plan. No credit card required to start your trial.',
  },
  {
    question: 'What happens to my data if I cancel?',
    answer: 'You can export all your data before canceling. We retain your data for 30 days after cancellation in case you want to reactivate.',
  },
  {
    question: 'Do you offer discounts for non-profits?',
    answer: 'Yes! Non-profit organizations and educational institutions receive a 30% discount on all paid plans. Contact our sales team for details.',
  },
  {
    question: 'Can I add more storage to my plan?',
    answer: 'Absolutely! Additional storage can be purchased at $5 per 10GB per month on any plan.',
  },
];

const Pricing = () => {
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
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Simple Pricing For
              <span className="block bg-gradient-to-r from-neon-cyan to-neon-indigo bg-clip-text text-transparent">
                Every Community
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Choose the perfect plan for your community. All plans include our core features.
            </p>
          </motion.div>

          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto mb-20">
            {tiers.map((tier, index) => {
              const Icon = tier.icon;
              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex"
                >
                  <Card className={`flex flex-col w-full ${tier.highlighted ? 'glass-card border-neon-cyan neon-glow-cyan' : 'glass-card'}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tier.highlighted ? 'bg-gradient-to-br from-neon-cyan to-neon-indigo' : 'bg-muted'}`}>
                          <Icon className={`w-6 h-6 ${tier.highlighted ? 'text-background' : 'text-foreground'}`} />
                        </div>
                        {tier.highlighted && (
                          <span className="px-3 py-1 bg-gradient-to-r from-neon-cyan to-neon-indigo text-background text-xs font-medium rounded-full">
                            Most Popular
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-2xl">{tier.name}</CardTitle>
                      <CardDescription className="text-base">{tier.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl md:text-5xl font-bold">{tier.price}</span>
                        {tier.period && <span className="text-muted-foreground ml-2">/ {tier.period}</span>}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <ul className="space-y-3">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-start space-x-3">
                            <Check className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
                            <span className="text-sm md:text-base">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className={`w-full ${tier.highlighted ? 'bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90' : ''}`}
                        variant={tier.highlighted ? 'default' : 'outline'}
                        size="lg"
                      >
                        {tier.cta} <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 glass-card p-8 md:p-12 rounded-3xl text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Still have questions?</h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Our team is here to help you find the perfect plan for your community.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90">
                  Start Free Trial
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="glass border-glass-border">
                Contact Sales
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const FAQItem = ({ question, answer, index }: { question: string; answer: string; index: number }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full glass-card p-4 md:p-6 rounded-xl hover:bg-muted/50 transition-colors text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold pr-4">{question}</h3>
            <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 md:px-6 py-4 text-sm md:text-base text-muted-foreground">
            {answer}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
};

export default Pricing;
