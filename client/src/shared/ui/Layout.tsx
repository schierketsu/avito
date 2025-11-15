import React from 'react';
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Toolbar,
  Typography,
  Button,
  LinearProgress
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useThemeMode } from '@shared/theme/ThemeModeContext';
import { useIsFetching } from '@tanstack/react-query';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { mode, toggleMode } = useThemeMode();
  const isFetching = useIsFetching();

  const lightLogoSrc = new URL('../../ass/Avito_logo.svg.png', import.meta.url).href;
  const darkLogoSrc = new URL('../../ass/Avito_logo_темнаятема.svg.png', import.meta.url).href;

  const getHeader = (): { title: string; subtitle?: string } => {
    if (location.pathname.startsWith('/stats')) {
      return { title: 'Аналитика' };
    }
    if (location.pathname.startsWith('/item')) {
      return { title: 'Детальный просмотр' };
    }
    if (location.pathname.startsWith('/list')) {
      return { title: 'Главная страница' };
    }
    return { title: 'Система модерации', subtitle: location.pathname };
  };

  const { title, subtitle } = getHeader();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 0.5
              }}
            >
              <Box
                component="img"
                src={mode === 'dark' ? darkLogoSrc : lightLogoSrc}
                alt="Авито · Модерация объявлений"
                sx={{ height: 56, mt: 2 }}
              />
              <Typography variant="h4">
                Модерация объявлений
              </Typography>
            </Box>
          </Box>
          <Button component={Link} to="/list" color="inherit">
            Список
          </Button>
          <Button component={Link} to="/stats" color="inherit">
            Статистика
          </Button>
          <IconButton
            color="inherit"
            onClick={toggleMode}
            sx={{ ml: 1 }}
            aria-label={mode === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
          >
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
        {isFetching > 0 && <LinearProgress sx={{ position: 'absolute', left: 0, right: 0, bottom: 0 }} />}
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {subtitle}
          </Typography>
        )}
        <Box
          sx={{
            mt: 3,
            '@keyframes fade-in': {
              from: { opacity: 0, transform: 'translateY(4px)' },
              to: { opacity: 1, transform: 'none' }
            },
            animation: 'fade-in 0.25s ease-out'
          }}
        >
          {children}
        </Box>
      </Container>
    </Box>
  );
};


