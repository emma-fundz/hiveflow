import { Users, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="glass border-t border-glass-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-indigo flex items-center justify-center">
                <Users className="w-5 h-5 text-background" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-neon-cyan to-neon-indigo bg-clip-text text-transparent">
                ClubManager
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Manage your community in one tap. Futuristic, beautiful, and powerful.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <div className="space-y-2">
              <Link to="/features" className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Features
              </Link>
              <Link to="/pricing" className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Pricing
              </Link>
              <Link to="/roadmap" className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Roadmap
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <div className="space-y-2">
              <Link to="/about" className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                About
              </Link>
              <Link to="/blog" className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Blog
              </Link>
              <Link to="/careers" className="block text-muted-foreground hover:text-primary text-sm transition-colors">
                Careers
              </Link>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 rounded-lg glass hover:bg-primary/10 flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg glass hover:bg-primary/10 flex items-center justify-center transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg glass hover:bg-primary/10 flex items-center justify-center transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>© 2025 ClubManager. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
