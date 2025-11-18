import { useEffect, useState } from "react";
import { records } from "../lib/cocobaseClient";

export function useReactions(eventId: string) {
  const [reactions, setReactions] = useState<any[]>([]);

  const load = async () => {
    try {
      const response = await records.list("reactions", {
        filter: { eventId }
      });

      const items = response?.items ?? response ?? [];
      setReactions(items);
    } catch (e) {
      console.error("load reactions error:", e);
    }
  };

  const react = async (userId: string, type: string) => {
    const payload = {
      id: `${eventId}-${userId}-${type}`,
      eventId,
      userId,
      type,
      createdAt: Date.now()
    };

    await records.create("reactions", payload);
  };

  useEffect(() => {
    load();

    const unsub = records.subscribe("reactions", (evt) => {
      if (!evt?.data) return;
      if (evt.data.eventId !== eventId) return;

      if (evt.event === "create") {
        setReactions(prev => [...prev, evt.data]);
      }
      if (evt.event === "delete") {
        setReactions(prev => prev.filter(r => r.id !== evt.data.id));
      }
      if (evt.event === "update") {
        setReactions(prev =>
          prev.map(r => (r.id === evt.data.id ? evt.data : r))
        );
      }
    });

    return () => unsub && unsub();
  }, [eventId]);

  return { reactions, react };
}
