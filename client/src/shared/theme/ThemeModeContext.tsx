import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createTheme, Theme } from '@mui/material';

type ThemeMode = 'light' | 'dark';

interface ThemeModeContextValue {
  mode: ThemeMode;
  theme: Theme;
  toggleMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

const STORAGE_KEY = 'avito-moderation-theme';

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored === 'light' || stored === 'dark') {
      setMode(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#005FF9'
          },
          secondary: {
            main: '#FF9900'
          }
        },
        shape: {
          borderRadius: 10
        }
      }),
    [mode]
  );

  const value = useMemo<ThemeModeContextValue>(
    () => ({
      mode,
      theme,
      toggleMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
    }),
    [mode, theme]
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
};

export const useThemeMode = (): ThemeModeContextValue => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }
  return ctx;
};


