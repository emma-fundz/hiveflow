import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseDraftsOptions {
  key: string;
  value: string;
  delay?: number;
  onSave?: () => void;
}

export const useDrafts = ({ key, value, delay = 5000, onSave }: UseDraftsOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedValue = useRef<string>('');

  const saveDraft = useCallback(() => {
    if (value && value !== lastSavedValue.current) {
      localStorage.setItem(key, value);
      lastSavedValue.current = value;
      toast.success('Draft saved', {
        duration: 2000,
        position: 'bottom-right',
      });
      onSave?.();
    }
  }, [key, value, onSave]);

  // Autosave effect
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value) {
      timeoutRef.current = setTimeout(() => {
        saveDraft();
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, saveDraft]);

  const loadDraft = useCallback((): string | null => {
    return localStorage.getItem(key);
  }, [key]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
    lastSavedValue.current = '';
  }, [key]);

  const forceSave = useCallback(() => {
    saveDraft();
  }, [saveDraft]);

  return {
    loadDraft,
    clearDraft,
    forceSave,
  };
};
