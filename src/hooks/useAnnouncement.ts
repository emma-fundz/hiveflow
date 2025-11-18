// src/hooks/useEvents.ts
import { useEffect, useState, useCallback } from 'react';
import { records } from '../lib/cocobaseClient';

export function useEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const list = await records.get('events', undefined, { orderBy: 'startsAt_desc', limit: 50 });
      setEvents(list || []);
    } catch (err) {
      console.error('fetchEvents error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();

    // subscribe to realtime updates (adapt to SDK)
    const unsubscribe = records.subscribe('events', (evt: any) => {
      // evt could be { type: 'create'|'update'|'delete', record }
      if (evt.type === 'create') setEvents(prev => [evt.record, ...prev]);
      if (evt.type === 'update') setEvents(prev => prev.map(e => (e.id === evt.record.id ? evt.record : e)));
      if (evt.type === 'delete') setEvents(prev => prev.filter(e => e.id !== evt.record.id));
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchEvents]);

  const createEvent = async (payload: any) => {
    const created = await records.create('events', payload);
    // optimistic: events set handled by realtime but also update locally
    setEvents(prev => [created, ...prev]);
    return created;
  };

  const updateEvent = async (id: string, payload: any) => {
    const res = await records.update('events', id, payload);
    setEvents(prev => prev.map(e => (e.id === id ? res : e)));
    return res;
  };

  const deleteEvent = async (id: string) => {
    await records.delete('events', id);
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  return { events, loading, fetchEvents, createEvent, updateEvent, deleteEvent };
}
