import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { App } from '@app/App';
import { useThemeMode, ThemeModeProvider } from '@shared/theme/ThemeModeContext';

const queryClient = new QueryClient();

const AppWithProviders: React.FC = () => {
  const { theme } = useThemeMode();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeModeProvider>
      <AppWithProviders />
    </ThemeModeProvider>
  </React.StrictMode>
);


