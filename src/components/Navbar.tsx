import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import db from '@/lib/cocobase';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const workspaceId = (user as any)?.workspaceId ?? (user as any)?.id;
  const authUserId = (user as any)?.id as string | undefined;
  const role = (user as any)?.role as string | undefined;
  const isOwner = !(user as any)?.workspaceId;
  const isAdmin = role === 'Admin' || isOwner;

  const { data: membershipDocs = [] } = useQuery({
    queryKey: ['navbar-memberships', authUserId],
    queryFn: async () => {
      if (!authUserId) return [];
      const docs = await db.listDocuments('members', {
        filters: { authUserId },
        sort: 'created_at',
        order: 'desc',
      });
      return docs;
    },
    enabled: isAuthenticated && !!authUserId,
  });

  const workspaceOptions = (membershipDocs as any[])
    .map((doc) => {
      const data = (doc as any).data || {};
      const wsId = (data.ownerId as string | undefined) || authUserId;
      const baseLabel =
        (data.workspaceName as string | undefined) ||
        (data.communityName as string | undefined) ||
        (data.displayRole ? `${data.displayRole} workspace` : undefined);

      const label =
        baseLabel ||
        (wsId
          ? `Community ${String(wsId).slice(0, 6)}`
          : 'Community');

      return {
        id: wsId as string,
        label,
        role: (data.role as string | undefined) || 'Member',
      };
    })
    .filter((ws) => !!ws.id);

  const uniqueWorkspaces: { id: string; label: string; role: string }[] = [];
  const seen = new Set<string>();

  for (const ws of workspaceOptions) {
    if (!seen.has(ws.id)) {
      seen.add(ws.id);
      uniqueWorkspaces.push(ws);
    }
  }

  const { data: notificationDocs = [] } = useQuery({
    queryKey: ['navbar-notifications', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const docs = await db.listDocuments('notifications', {
        filters: { ownerId: workspaceId },
        sort: 'created_at',
        order: 'desc',
      });
      return docs;
    },
    enabled: isAuthenticated && !!workspaceId,
  });

  const notifications = (notificationDocs as any[]).map((doc: any) => {
    const data = doc.data || {};
    const createdAt = (data.createdAt as string | undefined) || (doc as any).created_at;
    return {
      id: doc.id,
      title: (data.title as string | undefined) || 'Notification',
      body: (data.body as string | undefined) || '',
      url: (data.url as string | undefined) || '/dashboard',
      createdAt,
      createdAtLabel: createdAt ? new Date(createdAt).toLocaleString() : '',
      type: (data.type as string | undefined) || 'info',
      readBy: ((data.readBy as string[] | undefined) || []) as string[],
    };
  });

  const visibleNotifications = isAdmin
    ? []
    : notifications.filter((n) => !authUserId || !n.readBy.includes(authUserId));

  const unreadCount = visibleNotifications.length;

  const handleNotificationClick = async (id: string, readBy: string[] = []) => {
    if (!authUserId) return;
    if (readBy.includes(authUserId)) return;
    try {
      const nextReadBy = Array.from(new Set([...readBy, authUserId]));
      await db.updateDocument('notifications', id, { readBy: nextReadBy });
    } catch (err) {
      console.log('NOTIFICATION MARK READ ERROR:', err);
    }
  };

  const handleWorkspaceChange = (event: any) => {
    const newWorkspaceId = event.target.value as string;
    if (!newWorkspaceId || newWorkspaceId === workspaceId || !user) return;

    const selected = uniqueWorkspaces.find((ws) => ws.id === newWorkspaceId);
    const nextRole = selected?.role || (user as any)?.role;

    try {
      const updatedUser = {
        ...(user as any),
        workspaceId: newWorkspaceId,
        role: nextRole,
      };
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('hf_auth_user', JSON.stringify(updatedUser));
      }
      window.location.reload();
    } catch (err) {
      console.log('WORKSPACE SWITCH ERROR:', err);
    }
  };

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-indigo flex items-center justify-center overflow-hidden">
              <img
                src="/logo.jpg"
                alt="HiveFlow"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-neon-cyan to-neon-indigo bg-clip-text text-transparent">
              HiveFlow
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
                <Link to="/chat" className="text-foreground hover:text-primary transition-colors">
                  Chat
                </Link>
                <Link to="/files" className="text-foreground hover:text-primary transition-colors">
                  Files
                </Link>
                <Link to="/announcements" className="text-foreground hover:text-primary transition-colors">
                  Announcements
                </Link>
                {user?.email === 'admin@clubmanager.com' && (
                  <Link to="/admin" className="text-foreground hover:text-primary transition-colors">
                    Admin
                  </Link>
                )}
                {uniqueWorkspaces.length > 1 && (
                  <div className="flex items-center">
                    <select
                      value={workspaceId || ''}
                      onChange={handleWorkspaceChange}
                      className="text-xs px-2 py-1 rounded-lg border border-border bg-background/60 text-muted-foreground hover:text-foreground focus:outline-none"
                    >
                      {uniqueWorkspaces.map((ws) => (
                        <option key={ws.id} value={ws.id}>
                          {ws.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {!isAdmin && (
                  <div className="relative">
                    <button
                      className="relative p-2 hover:bg-muted rounded-lg transition-colors"
                      onClick={() => setNotificationsOpen(!notificationsOpen)}
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
                      )}
                    </button>
                    {notificationsOpen && (
                      <div className="absolute right-0 mt-2 w-80 glass-card border border-glass-border rounded-xl shadow-lg max-h-96 overflow-y-auto z-50">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-border/60">
                          <span className="text-sm font-medium">Notifications</span>
                          <span className="text-xs text-muted-foreground">
                            {unreadCount ? `${unreadCount} new` : 'No new notifications'}
                          </span>
                        </div>
                        <div className="p-2 space-y-1">
                          {visibleNotifications.length === 0 && (
                            <p className="text-xs text-muted-foreground px-2 py-3">
                              No notifications yet.
                            </p>
                          )}
                          {visibleNotifications.slice(0, 10).map((n) => (
                            <Link
                              key={n.id}
                              to={n.url}
                              className="flex flex-col px-3 py-2 rounded-lg hover:bg-muted/60 text-xs"
                              onClick={() => {
                                handleNotificationClick(n.id, n.readBy);
                                setNotificationsOpen(false);
                              }}
                            >
                              <span className="font-medium text-foreground">{n.title}</span>
                              {n.body && (
                                <span className="text-muted-foreground line-clamp-2">
                                  {n.body}
                                </span>
                              )}
                              {n.createdAtLabel && (
                                <span className="text-[10px] text-muted-foreground mt-1">
                                  {n.createdAtLabel}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                <Link to="/chat" className="block py-2 text-foreground hover:text-primary transition-colors">
                  Chat
                </Link>
                <Link to="/files" className="block py-2 text-foreground hover:text-primary transition-colors">
                  Files
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
                {!isAdmin && visibleNotifications.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-border/60 space-y-1">
                    <p className="text-xs text-muted-foreground mb-1">Notifications</p>
                    {visibleNotifications.slice(0, 5).map((n) => (
                      <Link
                        key={n.id}
                        to={n.url}
                        className="block px-2 py-1 rounded-lg hover:bg-muted/60 text-xs"
                        onClick={() => {
                          handleNotificationClick(n.id, n.readBy);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <span className="block font-medium text-foreground">{n.title}</span>
                        {n.body && (
                          <span className="block text-muted-foreground line-clamp-2">
                            {n.body}
                          </span>
                        )}
                        {n.createdAtLabel && (
                          <span className="block text-[10px] text-muted-foreground mt-0.5">
                            {n.createdAtLabel}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
                {uniqueWorkspaces.length > 1 && (
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground mb-1">Switch community</p>
                    <select
                      value={workspaceId || ''}
                      onChange={handleWorkspaceChange}
                      className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background/60"
                    >
                      {uniqueWorkspaces.map((ws) => (
                        <option key={ws.id} value={ws.id}>
                          {ws.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
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
