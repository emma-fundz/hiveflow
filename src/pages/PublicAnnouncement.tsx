import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Megaphone } from 'lucide-react';
import { toast } from 'sonner';

interface PublicAnnouncementPayload {
  content: string;
  authorName: string;
  authorRole: string;
  createdAt?: string;
  imageUrl?: string;
}

function decodeAnnouncementToken(token: string): PublicAnnouncementPayload | null {
  try {
    const decoded = decodeURIComponent(token);
    const json = window.atob(decoded);
    const payload = JSON.parse(json);
    return payload;
  } catch (err) {
    console.log('PUBLIC ANNOUNCEMENT TOKEN DECODE ERROR:', err);
    return null;
  }
}

const PublicAnnouncement = () => {
  const { token } = useParams<{ token: string }>();
  const [payload, setPayload] = useState<PublicAnnouncementPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const decoded = decodeAnnouncementToken(token);
    if (!decoded) {
      toast.error('This announcement link is not valid.');
      setLoading(false);
      return;
    }

    setPayload(decoded);
    setLoading(false);
  }, [token]);

  const createdAtLabel = payload?.createdAt
    ? new Date(payload.createdAt).toLocaleString()
    : '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="glass-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-indigo flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-background" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Community Announcement</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Shared from HiveFlow
              </p>
            </div>
          </div>

          {loading && (
            <p className="text-sm text-muted-foreground">Loading announcement...</p>
          )}

          {!loading && !payload && (
            <p className="text-sm text-destructive">Announcement not found.</p>
          )}

          {!loading && payload && (
            <div className="space-y-4">
              {payload.imageUrl && (
                <div className="overflow-hidden rounded-2xl border border-border/50 max-h-72">
                  <img
                    src={payload.imageUrl}
                    alt="Announcement"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-1">From</p>
                <p className="font-semibold text-foreground">
                  {payload.authorName}{' '}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary align-middle">
                    {payload.authorRole}
                  </span>
                </p>
                {createdAtLabel && (
                  <p className="text-xs text-muted-foreground mt-1">{createdAtLabel}</p>
                )}
              </div>

              <div className="prose prose-invert max-w-none mt-4">
                <p className="whitespace-pre-wrap text-sm sm:text-base">
                  {payload.content}
                </p>
              </div>

              <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
                  Like what you see? Join this community on HiveFlow to get updates,
                  events, and more in a beautiful dashboard.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link to="/register">
                    <Button className="w-full sm:w-auto bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90">
                      Create account
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" className="w-full sm:w-auto">
                      I already have an account
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default PublicAnnouncement;
