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

    // Define alternative accessible color tokens per color-blind mode
    if (colorBlindMode === 'normal') {
      // Reset to default tokens
      root.style.removeProperty('--primary');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--neon-cyan');
      root.style.removeProperty('--neon-indigo');
    } else if (colorBlindMode === 'deuteranopia') {
      // Blue + amber palette
      root.style.setProperty('--primary', '210 100% 50%'); // Blue
      root.style.setProperty('--secondary', '40 100% 55%'); // Amber
      root.style.setProperty('--neon-cyan', '210 100% 50%');
      root.style.setProperty('--neon-indigo', '40 100% 55%');
    } else if (colorBlindMode === 'protanopia') {
      // Teal + magenta palette
      root.style.setProperty('--primary', '190 100% 45%'); // Teal
      root.style.setProperty('--secondary', '310 80% 60%'); // Magenta
      root.style.setProperty('--neon-cyan', '190 100% 45%');
      root.style.setProperty('--neon-indigo', '310 80% 60%');
    } else if (colorBlindMode === 'tritanopia') {
      // Green + red palette
      root.style.setProperty('--primary', '120 60% 50%'); // Green
      root.style.setProperty('--secondary', '0 85% 60%'); // Red
      root.style.setProperty('--neon-cyan', '120 60% 50%');
      root.style.setProperty('--neon-indigo', '0 85% 60%');
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
