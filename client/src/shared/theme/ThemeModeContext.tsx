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
            // Авито синий
            main: '#02ABFF'
          },
          secondary: {
            // Авито фиолетовый
            main: '#985EEC'
          },
          success: {
            // Авито зелёный
            main: '#02E161'
          },
          error: {
            // Авито красный
            main: '#FF3D52'
          },
          background: {
            default: mode === 'light' ? '#f5f7fa' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e'
          }
        },
        shape: {
          borderRadius: 10
        },
        typography: {
          fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          h4: {
            fontWeight: 600,
            letterSpacing: 0.2
          },
          h5: {
            fontWeight: 600
          },
          subtitle1: {
            fontWeight: 500
          },
          button: {
            textTransform: 'none',
            fontWeight: 500
          }
        },
        components: {
          MuiButton: {
            defaultProps: {
              disableElevation: true
            },
            styleOverrides: {
              root: {
                borderRadius: 999,
                paddingInline: 18
              }
            }
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 12
              }
            }
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16
              }
            }
          },
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                fontSize: 12
              }
            }
          }
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


