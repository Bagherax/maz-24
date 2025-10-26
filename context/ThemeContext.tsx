import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import type { Theme } from '../types';
import * as api from '../api';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setLiveTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  loadTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STYLE_ID = 'mazdady-dynamic-theme';

/**
 * Applies the customizable theme by injecting a <style> tag.
 * This is the correct approach to avoid CSS specificity issues where inline
 * styles would override the stylesheet's dark mode rules.
 * @param theme The theme object with color values.
 */
const applyTheme = (theme: Theme) => {
  let styleTag = document.getElementById(THEME_STYLE_ID);
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = THEME_STYLE_ID;
    document.head.appendChild(styleTag);
  }
  
  const themeVariables = Object.entries(theme)
    .map(([key, value]) => `--color-${key}: ${value};`)
    .join('\n');
    
  styleTag.innerHTML = `:root { ${themeVariables} }`;
};


const applyThemeMode = (mode: ThemeMode) => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>({
    primary: '#FFFFFF',
    secondary: '#F3F4F6',
    accent: '#4F46E5',
    'accent-hover': '#4338CA',
    'text-primary': '#111827',
    'text-secondary': '#6B7280',
    'border-color': '#E5E7EB',
  });
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
      return (localStorage.getItem('mazdady_theme_mode') as ThemeMode) || 'light';
  });

  const loadTheme = useCallback(async () => {
    const fetchedTheme = await api.getTheme();
    setTheme(fetchedTheme);
    applyTheme(fetchedTheme);
  }, []);

  // Effect for loading the P2P-distributed theme.
  // Runs on mount and when the theme is updated in another tab.
  useEffect(() => {
    loadTheme();

    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'mazdady_global_theme') {
            console.log("Received 'ThemeUpdateEvent' from P2P network simulation.");
            loadTheme();
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadTheme]);

  // Effect for applying the light/dark mode class.
  // Runs whenever themeMode state changes.
  useEffect(() => {
    applyThemeMode(themeMode);
  }, [themeMode]);
  
  const toggleTheme = () => {
      setThemeMode(prevMode => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('mazdady_theme_mode', newMode);
          // The useEffect hook above will handle applying the class change.
          return newMode;
      });
  };

  const setLiveTheme = (newTheme: Theme) => {
      setTheme(newTheme);
      applyTheme(newTheme);
  }

  const value = {
    theme,
    themeMode,
    setLiveTheme,
    toggleTheme,
    loadTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
