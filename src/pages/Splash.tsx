import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { usePrefs } from '@/context/PrefsContext';

const Splash = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { prefersReducedMotion } = usePrefs();
  const location = useLocation();

  useEffect(() => {
    const state = (location.state || {}) as { next?: string };
    const nextPath = state?.next || '/dashboard';
    const timer = setTimeout(() => {
      navigate(nextPath, { replace: true });
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate, location]);

  const name = (user as any)?.name || (user as any)?.email || 'Welcome to HiveFlow';

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 gradient-radial" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-neon-cyan/25 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-indigo/25 rounded-full blur-3xl" />

      <motion.div
        initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
        animate={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-10 rounded-3xl w-full max-w-lg relative z-10 mx-4 text-center"
      >
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, rotate: 0 } : { opacity: 0, rotate: -10 }}
          animate={prefersReducedMotion ? { opacity: 1, rotate: 0 } : { opacity: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-neon-cyan to-neon-indigo flex items-center justify-center overflow-hidden shadow-lg"
        >
          <img
            src="/logo.jpg"
            alt="HiveFlow"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.h1
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          animate={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl md:text-4xl font-bold mb-2"
        >
          Welcome to <span className="bg-gradient-to-r from-neon-cyan to-neon-indigo bg-clip-text text-transparent">HiveFlow</span>
        </motion.h1>

        <motion.p
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-muted-foreground mb-6"
        >
          {typeof name === 'string' ? `Hey ${name.split(' ')[0]}, your workspace is getting ready...` : 'Your workspace is getting ready...'}
        </motion.p>

        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="w-full h-2 bg-black/20 rounded-full overflow-hidden mb-4"
        >
          <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-indigo animate-loading-bar" />
        </motion.div>

        <p className="text-xs text-muted-foreground">
          Redirecting you to your dashboard...
        </p>
      </motion.div>
    </div>
  );
};

export default Splash;
