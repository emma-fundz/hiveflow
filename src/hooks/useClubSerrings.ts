import { useEffect, useState } from "react";
import { records } from "../lib/cocobaseClient";

export function useClubSettings(clubId: string) {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const response = await records.list("club_settings", {
        filter: { clubId }
      });

      const items = response?.items ?? response ?? [];
      setSettings(items[0] || {});
    } catch (err) {
      console.error("club settings load error:", err);
    }

    setLoading(false);
  };

  const update = async (payload: any) => {
    if (!settings?.id) {
      // create if it doesn’t exist
      const created = await records.create("club_settings", {
        ...payload,
        clubId
      });

      setSettings(created);
      return;
    }

    await records.update("club_settings", settings.id, payload);
    setSettings({ ...settings, ...payload });
  };

  useEffect(() => {
    load();

    const unsub = records.subscribe("club_settings", (evt) => {
      if (evt?.data?.clubId !== clubId) return;

      if (evt.event === "update") {
        setSettings(evt.data);
      }
    });

    return () => unsub && unsub();
  }, [clubId]);

  return { settings, loading, update };
}
