import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface PrefsContextType {
  prefersReducedMotion: boolean;
}

const PrefsContext = createContext<PrefsContextType | undefined>(undefined);

export const PrefsProvider = ({ children }: { children: ReactNode }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <PrefsContext.Provider value={{ prefersReducedMotion }}>
      {children}
    </PrefsContext.Provider>
  );
};

export const usePrefs = () => {
  const context = useContext(PrefsContext);
  if (!context) {
    throw new Error('usePrefs must be used within PrefsProvider');
  }
  return context;
};
