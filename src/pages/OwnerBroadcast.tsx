import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Megaphone } from 'lucide-react';

const OWNER_EMAIL = (import.meta.env.VITE_OWNER_EMAIL as string | undefined) || 'admin@clubmanager.com';

const OwnerBroadcast = () => {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [ctaLabel, setCtaLabel] = useState('Open HiveFlow');
  const [ctaUrl, setCtaUrl] = useState('');
  const [sending, setSending] = useState(false);

  const isOwner = user?.email === OWNER_EMAIL;

  if (!isOwner) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <Card className="glass-card p-6 text-center text-sm text-muted-foreground">
          This page is only available to the HiveFlow owner.
        </Card>
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !title.trim() || !message.trim()) {
      toast.error('Subject, title and message are required');
      return;
    }

    try {
      setSending(true);
      const baseUrl = (import.meta.env.VITE_APP_BASE_URL as string | undefined) || window.location.origin;
      const url = '/.netlify/functions/global-broadcast';
      const finalCtaUrl = ctaUrl || baseUrl;

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: subject.trim(),
          title: title.trim(),
          message: message.trim(),
          ctaLabel: ctaLabel.trim() || 'Open HiveFlow',
          ctaUrl: finalCtaUrl,
          email: user?.email,
          userId: (user as any)?.id,
        }),
      });

      const text = await resp.text();
      if (!resp.ok) {
        console.log('GLOBAL BROADCAST ERROR:', resp.status, text);
        toast.error('Failed to send global announcement');
        return;
      }

      toast.success('Global announcement sent to all HiveFlow members');
      setSubject('');
      setTitle('');
      setMessage('');
    } catch (err) {
      console.log('GLOBAL BROADCAST NETWORK ERROR:', err);
      toast.error('Failed to send global announcement');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-primary" />
          Global HiveFlow Announcement
        </h1>
        <p className="text-sm text-muted-foreground">
          Send an important message from you (the HiveFlow owner) to every user. This will be emailed to all
          members and shown as a global announcement inside the app.
        </p>
      </div>

      <Card className="glass-card p-6 space-y-4">
        <form onSubmit={handleSend} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Subject</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. New HiveFlow update"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Announcement Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Big improvements to community chat"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Write your global message here. This will be sent by email and shown inside the app."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">CTA Label (optional)</label>
              <Input
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="Open HiveFlow"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">CTA URL (optional)</label>
              <Input
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://... (defaults to your app URL if left empty)"
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              This will send a single email to every known HiveFlow member email and create a global in-app
              announcement.
            </span>
            <span>Owner: {user?.email}</span>
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90"
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send to everyone'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default OwnerBroadcast;
