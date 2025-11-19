import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Bell, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-glass-border"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-indigo flex items-center justify-center">
              <Users className="w-6 h-6 text-background" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-neon-cyan to-neon-indigo bg-clip-text text-transparent">
              ClubManager
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link to="/members" className="text-foreground hover:text-primary transition-colors">
                  Members
                </Link>
                <Link to="/events" className="text-foreground hover:text-primary transition-colors">
                  Events
                </Link>
                <Link to="/announcements" className="text-foreground hover:text-primary transition-colors">
                  Announcements
                </Link>
                {user?.email === 'admin@clubmanager.com' && (
                  <Link to="/admin" className="text-foreground hover:text-primary transition-colors">
                    Admin
                  </Link>
                )}
                <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
                </button>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Search className="w-5 h-5" />
                </button>
                <Link to="/settings">
                  <Avatar className="w-8 h-8 ring-2 ring-primary">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                </Link>
              </>
            ) : (
              <>
                <Link to="/features" className="text-foreground hover:text-primary transition-colors">
                  Features
                </Link>
                <Link to="/pricing" className="text-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
                <Link to="/about" className="text-foreground hover:text-primary transition-colors">
                  About
                </Link>
                <Link to="/blog" className="text-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden mt-4 pb-4 space-y-3"
          >
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block py-2 text-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link to="/members" className="block py-2 text-foreground hover:text-primary transition-colors">
                  Members
                </Link>
                <Link to="/events" className="block py-2 text-foreground hover:text-primary transition-colors">
                  Events
                </Link>
                <Link to="/announcements" className="block py-2 text-foreground hover:text-primary transition-colors">
                  Announcements
                </Link>
                {user?.email === 'admin@clubmanager.com' && (
                  <Link to="/admin" className="block py-2 text-foreground hover:text-primary transition-colors">
                    Admin
                  </Link>
                )}
                <Link to="/settings" className="block py-2 text-foreground hover:text-primary transition-colors">
                  Settings
                </Link>
              </>
            ) : (
              <div className="space-y-2">
                <Link to="/features" className="block py-2 text-foreground hover:text-primary transition-colors">
                  Features
                </Link>
                <Link to="/pricing" className="block py-2 text-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
                <Link to="/about" className="block py-2 text-foreground hover:text-primary transition-colors">
                  About
                </Link>
                <Link to="/blog" className="block py-2 text-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
                <Link to="/careers" className="block py-2 text-foreground hover:text-primary transition-colors">
                  Careers
                </Link>
                <div className="pt-2 space-y-2">
                  <Link to="/login" className="block">
                    <Button variant="ghost" className="w-full">Login</Button>
                  </Link>
                  <Link to="/register" className="block">
                    <Button className="w-full bg-gradient-to-r from-neon-cyan to-neon-indigo">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};
