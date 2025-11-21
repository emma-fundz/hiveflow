import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import db from '@/lib/cocobase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';

interface GlobalAnnouncementDoc {
  id: string;
  data: {
    title?: string;
    message?: string;
    subject?: string;
    ctaUrl?: string;
    ctaLabel?: string;
    createdAt?: string;
  };
}

export const GlobalAnnouncementBanner = () => {
  const { user } = useAuth();

  const { data: docs = [], isLoading, isError } = useQuery({
    queryKey: ['global-announcements'],
    queryFn: async () => {
      const results = await db.listDocuments('global_announcements', {
        sort: 'created_at',
        order: 'desc',
      });
      return results as any[];
    },
  });

  if (!user || isLoading || isError) return null;

  const doc = (docs as any[])[0] as GlobalAnnouncementDoc | undefined;
  if (!doc) return null;

  const data = doc.data || {};
  const title = data.title || 'Global HiveFlow announcement';
  const message = data.message || '';
  const createdAt = data.createdAt || undefined;
  const ctaUrl = data.ctaUrl || undefined;
  const ctaLabel = data.ctaLabel || 'Open HiveFlow';

  const storageKeyBase = `hf_global_announcement_dismissed_${doc.id}`;
  const storageKey = user?.id
    ? `${storageKeyBase}_${String((user as any).id)}`
    : storageKeyBase;

  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored === '1') {
        setDismissed(true);
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  if (dismissed) return null;

  const preview = message.length > 140 ? `${message.slice(0, 137)}...` : message;

  const createdLabel = createdAt
    ? new Date(createdAt).toLocaleString()
    : undefined;

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(storageKey, '1');
      } catch {
        // ignore
      }
    }
  };

  const handleToggle = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <Card className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center border border-border/70">
      <div className="flex items-start gap-3 w-full">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-indigo flex items-center justify-center text-background shrink-0">
          <Megaphone className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-[11px] uppercase tracking-[0.18em] text-neon-cyan/80">
            Global HiveFlow Announcement
          </p>
          <h2 className="text-base sm:text-lg font-semibold truncate">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap break-words max-h-24 overflow-y-auto">
            {expanded ? message : preview || 'A new update is available for all HiveFlow communities.'}
          </p>
          {createdLabel && (
            <p className="text-[11px] text-muted-foreground/80">
              Sent {createdLabel}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto justify-end sm:justify-center">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="flex-1 sm:flex-none"
          onClick={handleToggle}
        >
          {expanded ? 'Hide details' : 'View details'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="flex-1 sm:flex-none text-muted-foreground hover:text-foreground"
          onClick={handleDismiss}
        >
          Dismiss
        </Button>
      </div>
      {expanded && ctaUrl && (
        <div className="w-full sm:w-auto sm:self-end mt-1 sm:mt-0">
          <a
            href={ctaUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center text-xs sm:text-sm px-3 py-1.5 rounded-full bg-gradient-to-r from-neon-cyan to-neon-indigo text-background hover:opacity-90 transition-opacity"
          >
            {ctaLabel}
          </a>
        </div>
      )}
    </Card>
  );
};

export default GlobalAnnouncementBanner;
