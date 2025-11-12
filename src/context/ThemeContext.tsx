import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ColorBlindMode = 'normal' | 'deuteranopia' | 'protanopia' | 'tritanopia';

interface ThemeContextType {
  colorBlindMode: ColorBlindMode;
  setColorBlindMode: (mode: ColorBlindMode) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [colorBlindMode, setColorBlindModeState] = useState<ColorBlindMode>(() => {
    const saved = localStorage.getItem('colorBlindMode');
    return (saved as ColorBlindMode) || 'normal';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== 'false';
  });

  const setColorBlindMode = (mode: ColorBlindMode) => {
    setColorBlindModeState(mode);
    localStorage.setItem('colorBlindMode', mode);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('darkMode', String(newValue));
      return newValue;
    });
  };

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply dark mode class
    if (isDarkMode) {
      root.classList.remove('light');
    } else {
      root.classList.add('light');
    }

    // Apply color-blind mode styles
    root.setAttribute('data-color-blind-mode', colorBlindMode);

    // Define alternative accessible color tokens for color-blind modes
    if (colorBlindMode !== 'normal') {
      // Use more distinguishable colors for color-blind users
      root.style.setProperty('--primary', '210 100% 50%'); // Blue
      root.style.setProperty('--secondary', '45 100% 50%'); // Yellow
      root.style.setProperty('--neon-cyan', '210 100% 50%'); // Blue
      root.style.setProperty('--neon-indigo', '45 100% 50%'); // Yellow
    } else {
      // Reset to default
      root.style.removeProperty('--primary');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--neon-cyan');
      root.style.removeProperty('--neon-indigo');
    }
  }, [colorBlindMode, isDarkMode]);

  return (
    <ThemeContext.Provider value={{ colorBlindMode, setColorBlindMode, isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
