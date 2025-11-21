import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Docs = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 gradient-radial" />
      <div className="relative max-w-5xl mx-auto px-4 py-16 space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            HiveFlow <span className="bg-gradient-to-r from-neon-cyan to-neon-indigo bg-clip-text text-transparent">Docs</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A practical guide to running your community on HiveFlow: from inviting members
            and creating communities to changing themes, managing files, and sending
            announcements.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <Button asChild variant="outline" className="border-neon-cyan/40">
              <Link to="/register">Create your first community</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90">
              <Link to="/login">Go to app</Link>
            </Button>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="glass-card h-full p-6 space-y-3">
              <h2 className="text-xl font-semibold">1. Getting started</h2>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>
                  Visit <code>hive-flow.netlify.app</code> and click <strong>Sign Up</strong>.
                </li>
                <li>
                  After registering you&apos;ll land on the animated splash screen, then your
                  new dashboard.
                </li>
                <li>
                  Your account becomes the <strong>Admin</strong> of the first community
                  (workspace).
                </li>
              </ul>
            </Card>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card h-full p-6 space-y-3">
              <h2 className="text-xl font-semibold">2. Adding members</h2>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>From the sidebar, open <strong>Members</strong>.</li>
                <li>Use the <strong>Invite</strong> form to add a member&apos;s name & email.</li>
                <li>
                  HiveFlow sends them an invite link (via Coco Mailer) so they can join your
                  community as a member.
                </li>
                <li>
                  Invited members share the same workspace and will see your events,
                  announcements, analytics and files.
                </li>
              </ul>
            </Card>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="glass-card h-full p-6 space-y-3">
              <h2 className="text-xl font-semibold">3. Creating new communities</h2>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>
                  Go to <strong>Members</strong> and use the <strong>Create Community</strong>
                  action.
                </li>
                <li>
                  This creates a new workspace and adds you as the Admin for that community.
                </li>
                <li>
                  Use the generated <strong>share link</strong> so other logged-in users can
                  join directly via <code>/join/:token</code>.
                </li>
                <li>
                  Switch between communities using the <strong>workspace switcher</strong> in
                  the top-right of the navbar.
                </li>
              </ul>
            </Card>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card h-full p-6 space-y-3">
              <h2 className="text-xl font-semibold">4. Managing appearance & themes</h2>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>
                  Open <strong>Settings</strong> and scroll to the
                  <strong> Appearance</strong> section.
                </li>
                <li>
                  Toggle <strong>Dark Mode</strong> on/off for low-light or bright
                  environments.
                </li>
                <li>
                  Use <strong>Color-Blind Friendly Mode</strong> to pick between Normal,
                  Deuteranopia, Protanopia and Tritanopia palettes.
                </li>
                <li>
                  These modes adjust primary and accent colors to make charts and UI elements
                  more distinguishable.
                </li>
              </ul>
            </Card>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="glass-card h-full p-6 space-y-3">
              <h2 className="text-xl font-semibold">5. Updating your profile</h2>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>
                  In <strong>Settings → Profile Information</strong> you can change your full
                  name, bio and profile photo.
                </li>
                <li>
                  Click <strong>Change Photo</strong> to upload an image (JPG/PNG/GIF up to
                  5MB).
                </li>
                <li>
                  When you save, HiveFlow updates your member profile and refreshes your
                  avatar across the dashboard, announcements and events.
                </li>
              </ul>
            </Card>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card h-full p-6 space-y-3">
              <h2 className="text-xl font-semibold">6. Files & resources</h2>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>
                  Admins can access <strong>Files</strong> from the sidebar or the top
                  navigation.
                </li>
                <li>
                  Drag and drop files or click the upload area to attach resources (e.g.
                  flyers, PDFs, images).
                </li>
                <li>
                  Each file is stored per workspace; only members of that community can see
                  them.
                </li>
                <li>
                  Use the <strong>Copy link</strong> action to insert file URLs into events or
                  announcements.
                </li>
              </ul>
            </Card>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="glass-card h-full p-6 space-y-3">
              <h2 className="text-xl font-semibold">7. Announcements & notifications</h2>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>
                  Admins can post updates from the <strong>Announcements</strong> page.
                </li>
                <li>
                  Members can like and comment on announcements and share a public link to
                  WhatsApp or social media.
                </li>
                <li>
                  HiveFlow also creates in-app and email notifications so members don&apos;t
                  miss important updates.
                </li>
              </ul>
            </Card>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card h-full p-6 space-y-3">
              <h2 className="text-xl font-semibold">8. Events & chat</h2>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Use the <strong>Events</strong> page to schedule meetups and programs.</li>
                <li>
                  Each event card includes an <strong>Open Chat</strong> button that opens a
                  real-time discussion area for that event.
                </li>
                <li>
                  Messages are shown in a mobile-friendly chat layout, with support for
                  simple <code>@mentions</code> inside messages.
                </li>
              </ul>
            </Card>
          </motion.section>
        </div>

        <footer className="pt-4 border-t border-border/40 mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-muted-foreground">
          <span>Need more help? Reach out to your HiveFlow admin or community lead.</span>
          <span>
            Built for clubs, communities &amp; small teams running on{' '}
            <span className="bg-gradient-to-r from-neon-cyan to-neon-indigo bg-clip-text text-transparent font-semibold">
              HiveFlow
            </span>
            .
          </span>
        </footer>
      </div>
    </div>
  );
};

export default Docs;
