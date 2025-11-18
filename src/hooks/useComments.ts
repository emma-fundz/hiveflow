import { useEffect, useState, useCallback } from "react";
import { records } from "../lib/cocobaseClient";
import { v4 as uuid } from "uuid";

export function useComments(eventId: string) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial comments
  const load = useCallback(async () => {
    setLoading(true);

    try {
      const response = await records.list("comments", {
        filter: { eventId }
      });

      // Cocobase returns arrays differently depending on SDK version.
      const items = response?.items ?? response ?? [];

      setComments(items);
    } catch (err) {
      console.error("Failed to load comments:", err);
    }

    setLoading(false);
  }, [eventId]);

  // Create a new comment
  const create = async (payload: { userId: string; text: string }) => {
    const newComment = {
      id: uuid(),
      eventId,
      text: payload.text,
      userId: payload.userId,
      createdAt: Date.now()
    };

    await records.create("comments", newComment);
    setComments(prev => [...prev, newComment]);
  };

  // Realtime subscription
  useEffect(() => {
    load();

    const unsubscribe = records.subscribe("comments", (evt) => {
      if (!evt?.data) return;

      if (evt.event === "create" && evt.data.eventId === eventId) {
        setComments(prev => [...prev, evt.data]);
      }

      if (evt.event === "delete") {
        setComments(prev => prev.filter(c => c.id !== evt.data.id));
      }

      if (evt.event === "update") {
        setComments(prev =>
          prev.map(c => (c.id === evt.data.id ? evt.data : c))
        );
      }
    });

    return () => unsubscribe && unsubscribe();
  }, [eventId, load]);

  return { comments, loading, create };
}
