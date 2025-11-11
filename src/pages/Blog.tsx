import { motion } from 'framer-motion';
import { Calendar, Clock, User, Search, ArrowRight, Tag } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

const posts = [
  {
    title: '10 Tips for Building Engaged Online Communities',
    excerpt: 'Learn the secrets to creating communities that members love and actively participate in.',
    author: 'Sarah Chen',
    date: '2025-02-08',
    readTime: '8 min read',
    category: 'Community Building',
    tags: ['engagement', 'best practices', 'growth'],
    image: '/placeholder.svg',
  },
  {
    title: 'The Future of Community Management Software',
    excerpt: 'Exploring emerging trends in community tech and what they mean for leaders.',
    author: 'Marcus Johnson',
    date: '2025-02-05',
    readTime: '6 min read',
    category: 'Technology',
    tags: ['trends', 'technology', 'future'],
    image: '/placeholder.svg',
  },
  {
    title: 'How to Run Successful Virtual Events',
    excerpt: 'A complete guide to planning, promoting, and executing memorable online events.',
    author: 'Emma Rodriguez',
    date: '2025-02-01',
    readTime: '10 min read',
    category: 'Events',
    tags: ['events', 'virtual', 'planning'],
    image: '/placeholder.svg',
  },
  {
    title: 'Measuring Community Health: Key Metrics That Matter',
    excerpt: 'Beyond vanity metrics: what you should really be tracking in your community.',
    author: 'David Kim',
    date: '2025-01-28',
    readTime: '7 min read',
    category: 'Analytics',
    tags: ['analytics', 'metrics', 'growth'],
    image: '/placeholder.svg',
  },
  {
    title: 'Creating Inclusive Community Spaces',
    excerpt: 'Best practices for fostering diversity, equity, and inclusion in your community.',
    author: 'Sarah Chen',
    date: '2025-01-25',
    readTime: '9 min read',
    category: 'Community Building',
    tags: ['inclusion', 'diversity', 'culture'],
    image: '/placeholder.svg',
  },
  {
    title: 'Automating Community Management Tasks',
    excerpt: 'Save time and focus on what matters with smart automation strategies.',
    author: 'Marcus Johnson',
    date: '2025-01-22',
    readTime: '5 min read',
    category: 'Productivity',
    tags: ['automation', 'efficiency', 'tools'],
    image: '/placeholder.svg',
  },
];

const categories = ['All', 'Community Building', 'Technology', 'Events', 'Analytics', 'Productivity'];

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-neon-cyan to-neon-indigo bg-clip-text text-transparent">
                ClubManager Blog
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Insights, tips, and stories about building and managing thriving communities.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 glass border-glass-border text-base"
              />
            </div>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-12"
          >
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className={`${selectedCategory === category ? 'bg-gradient-to-r from-neon-cyan to-neon-indigo' : 'glass border-glass-border'}`}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </motion.div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card h-full flex flex-col hover:scale-[1.02] transition-transform group cursor-pointer">
                  {/* Featured Image */}
                  <div className="relative h-48 overflow-hidden rounded-t-lg bg-gradient-to-br from-neon-cyan/20 to-neon-indigo/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Tag className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-neon-cyan/20 text-neon-cyan border-0">
                        {post.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-neon-cyan transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm md:text-base">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="mt-auto">
                    <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-muted rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <Button variant="ghost" className="w-full group-hover:bg-muted/50">
                      Read Article <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-xl text-muted-foreground">No articles found matching your search.</p>
            </motion.div>
          )}

          {/* Load More / Pagination */}
          {filteredPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <Button size="lg" variant="outline" className="glass border-glass-border">
                Load More Articles
              </Button>
            </motion.div>
          )}

          {/* Newsletter CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 glass-card p-8 md:p-12 rounded-3xl text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Get the latest insights on community management delivered to your inbox weekly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="glass border-glass-border h-12"
              />
              <Button size="lg" className="bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90 whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
