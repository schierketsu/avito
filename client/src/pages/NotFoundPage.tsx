import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Stack, Typography } from '@mui/material';

export const NotFoundPage: React.FC = () => {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Страница не найдена</Typography>
      <Typography color="text.secondary">
        К сожалению, такой страницы нет. Вернитесь к списку объявлений.
      </Typography>
      <Button variant="contained" component={Link} to="/list">
        На главную
      </Button>
    </Stack>
  );
};


