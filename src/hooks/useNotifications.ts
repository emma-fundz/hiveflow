// src/hooks/useNotifications.ts
import { useState, useEffect } from 'react';
import { records } from '../lib/cocobaseClient';

export function useNotifications(userId: string) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const list = await records.list?.('notifications', { filter: { user_id: userId }, orderBy: 'created_at_desc', limit: 50 });
      if (!mounted) return;
      setItems(list || []);
    }
    load();

    const unsubscribe = records.subscribe('notifications', (evt: any) => {
      if (evt.record?.user_id !== userId) return;
      if (evt.type === 'create') setItems(prev => [evt.record, ...prev]);
      if (evt.type === 'update') setItems(prev => prev.map(i => (i.id === evt.record.id ? evt.record : i)));
    });

    return () => { mounted = false; if (unsubscribe) unsubscribe(); };
  }, [userId]);

  const markRead = async (id: string) => {
    await records.update('notifications', id, { read: true });
    setItems(prev => prev.map(i => (i.id === id ? { ...i, read: true } : i)));
  };

  return { items, markRead };
}
