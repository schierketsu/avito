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

  const getHeader = () => {
    if (location.pathname.startsWith('/stats')) {
      return { title: 'Аналитика', subtitle: '/stats — Статистика' };
    }
    if (location.pathname.startsWith('/item')) {
      return { title: 'Детальный просмотр', subtitle: '/item/:id — Объявление' };
    }
    if (location.pathname.startsWith('/list')) {
      return { title: 'Главная страница', subtitle: '/list — Список' };
    }
    return { title: 'Система модерации', subtitle: location.pathname };
  };

  const { title, subtitle } = getHeader();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Авито · Модерация объявлений
          </Typography>
          <Button component={Link} to="/list" color="inherit">
            Список
          </Button>
          <Button component={Link} to="/stats" color="inherit">
            Статистика
          </Button>
          <IconButton color="inherit" onClick={toggleMode} sx={{ ml: 1 }}>
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
        {isFetching > 0 && <LinearProgress sx={{ position: 'absolute', left: 0, right: 0, bottom: 0 }} />}
      </AppBar>
      <Container sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {subtitle}
        </Typography>
        <Box sx={{ mt: 3, animation: 'fade-in 0.2s ease-in-out' }}>{children}</Box>
      </Container>
    </Box>
  );
};


