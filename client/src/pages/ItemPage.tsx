import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Skeleton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import StarIcon from '@mui/icons-material/Star';
import HistoryIcon from '@mui/icons-material/History';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAdItem, useApproveAd, useRejectAd, useRequestChanges } from '@features/ads/hooks';
import type { Advertisement, ModerationHistory } from '@shared/api/types';
import { RejectModal } from '@features/ads/RejectModal';

interface ItemLocationState {
  listIds?: number[];
  from?: string;
}

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

const formatDateShort = (value: string) =>
  new Date(value).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

const formatPrice = (value: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(
    value
  );

const getTenure = (registeredAt: string) => {
  const start = new Date(registeredAt);
  const now = new Date();
  const years = now.getFullYear() - start.getFullYear();
  if (years > 0) {
    return `${years} лет`;
  }
  const months = now.getMonth() - start.getMonth() + years * 12;
  return `${Math.max(months, 1)} мес.`;
};

const Gallery: React.FC<{ images: string[]; title: string }> = ({ images, title }) => {
  const list = images.length ? images : ['https://via.placeholder.com/400x300?text=Фото'];
  const [main, ...rest] = list;
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <PhotoLibraryIcon fontSize="small" />
        <Typography variant="subtitle1">Галерея (3+)</Typography>
      </Stack>
      <Box
        component="img"
        src={main}
        alt={title}
        sx={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 2 }}
      />
      {rest.length > 0 && (
        <Stack direction="row" spacing={1}>
          {rest.map((img, idx) => (
            <Box
              // eslint-disable-next-line react/no-array-index-key
              key={idx}
              component="img"
              src={img}
              alt={`${title} ${idx + 2}`}
              sx={{
                width: 100,
                height: 70,
                objectFit: 'cover',
                borderRadius: 1,
                bgcolor: 'grey.200'
              }}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
};

const SellerBlock: React.FC<{ ad: Advertisement }> = ({ ad }) => {
  const { seller } = ad;
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Продавец
      </Typography>
      <Stack spacing={0.5}>
        <Typography>{seller.name}</Typography>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography color="text.secondary">Рейтинг:</Typography>
          <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
          <Typography color="text.secondary">{seller.rating}</Typography>
        </Stack>
        <Typography color="text.secondary">Кол-во объявлений: {seller.totalAds}</Typography>
        <Typography color="text.secondary">На сайте: {getTenure(seller.registeredAt)}</Typography>
      </Stack>
    </Paper>
  );
};

const ACTION_CONFIG: Record<ModerationHistory['action'], { label: string; color: 'success' | 'error' | 'warning' }> =
  {
    approved: { label: 'Одобрено', color: 'success' },
    rejected: { label: 'Отклонено', color: 'error' },
    requestChanges: { label: 'Доработка', color: 'warning' }
  };

const ModerationHistoryBlock: React.FC<{ history: ModerationHistory[] }> = ({ history }) => {
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <Paper sx={{ p: 2 }} variant="outlined">
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <HistoryIcon fontSize="small" />
        <Typography variant="subtitle1">История модерации</Typography>
      </Stack>
      {sortedHistory.length === 0 ? (
        <Typography color="text.secondary">Пока нет событий модерации для объявления.</Typography>
      ) : (
        <Box sx={{ mt: 1, position: 'relative' }}>
          {/* Непрерывная вертикальная линия таймлайна */}
          <Box
            sx={{
              position: 'absolute',
              left: 5,
              top: 13,
              bottom: 0,
              width: 2,
              bgcolor: 'divider',
              zIndex: 0
            }}
          />
          {sortedHistory.map((item, index) => {
            const config = ACTION_CONFIG[item.action];
            const isLast = index === sortedHistory.length - 1;

            return (
              <Box
                key={item.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  columnGap: 2,
                  alignItems: 'flex-start',
                  position: 'relative',
                  zIndex: 1,
                  '&:not(:last-of-type)': {
                    pb: 2
                  }
                }}
              >
                {/* Левая колонка — точка таймлайна */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    pt: 0.5
                  }}
                >
                  <Box
                    sx={(theme) => ({
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: theme.palette[config.color].main,
                      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                      position: 'relative',
                      zIndex: 2
                    })}
                  />
                </Box>

                {/* Правая колонка — контент события */}
                <Box sx={{ pb: isLast ? 0 : 2 }}>
                  <Stack spacing={0.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography fontWeight={500}>{item.moderatorName}</Typography>
                      <Chip label={config.label} size="small" color={config.color} variant="outlined" />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(item.timestamp)}
                    </Typography>
                    {item.reason && (
                      <Typography variant="body2">
                        Причина: {item.reason}
                      </Typography>
                    )}
                    {item.comment && (
                      <Typography variant="body2" color="text.secondary">
                        Комментарий: {item.comment}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Paper>
  );
};

export const ItemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as ItemLocationState;

  const adId = Number(id);
  const { data: ad, isLoading, isError } = useAdItem(adId);
  const approveMutation = useApproveAd();
  const rejectMutation = useRejectAd();
  const requestChangesMutation = useRequestChanges();
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [hotkeyHint, setHotkeyHint] = React.useState<string | null>(null);

  const listIds = state.listIds;
  const currentIndex = listIds?.indexOf(adId) ?? -1;
  const prevId = currentIndex > 0 ? listIds?.[currentIndex - 1] : undefined;
  const nextId =
    listIds && currentIndex >= 0 && currentIndex < listIds.length - 1
      ? listIds[currentIndex + 1]
      : undefined;

  const handleBackToList = () => {
    if (state.from) {
      navigate(state.from);
    } else {
      navigate('/list');
    }
  };

  const handleApprove = async () => {
    await approveMutation.mutateAsync(adId);
  };

  const handleReject = async (payload: { reason: string; comment?: string }) => {
    await rejectMutation.mutateAsync({ id: adId, ...payload });
    setRejectOpen(false);
  };

  const handleRequestChanges = async () => {
    await requestChangesMutation.mutateAsync({
      id: adId,
      reason: 'Доработка',
      comment: 'Вернуть на доработку'
    });
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.getAttribute('contenteditable') === 'true');
      if (isInput) return;

      if (event.key.toLowerCase() === 'a') {
        event.preventDefault();
        void handleApprove();
        setHotkeyHint('Объявление одобрено (горячая клавиша A).');
      }

      if (event.key.toLowerCase() === 'd') {
        event.preventDefault();
        setRejectOpen(true);
      }

      if (event.key === 'ArrowLeft' && prevId) {
        event.preventDefault();
        navigate(`/item/${prevId}`, { state });
      }

      if (event.key === 'ArrowRight' && nextId) {
        event.preventDefault();
        navigate(`/item/${nextId}`, { state });
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [adId, prevId, nextId, state, navigate]);

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Skeleton variant="rounded" height={320} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Skeleton variant="rounded" height={240} />
        </Grid>
      </Grid>
    );
  }

  if (isError || !ad) {
    return (
      <Stack spacing={2}>
        <Typography color="error">Не удалось загрузить объявление.</Typography>
        <Button variant="contained" onClick={handleBackToList}>
          Назад к списку
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Stack spacing={2}>
            <Gallery images={ad.images} title={ad.title} />

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {ad.title}
              </Typography>
              <Typography variant="h5" color="primary" gutterBottom>
                {formatPrice(ad.price)}
              </Typography>
              <Stack direction="row" spacing={1} mb={2}>
                <Chip label={ad.category} />
                <Chip label={formatDateShort(ad.createdAt)} variant="outlined" />
              </Stack>
              <Typography variant="subtitle1" gutterBottom>
                Полное описание
              </Typography>
              <Typography mb={2}>{ad.description}</Typography>

              <Typography variant="subtitle1" gutterBottom>
                Характеристики
              </Typography>
              <Table size="small">
                <TableBody>
                  {Object.entries(ad.characteristics).map(([key, value]: [string, string]) => (
                    <TableRow key={key}>
                      <TableCell sx={{ width: '30%' }}>{key}</TableCell>
                      <TableCell>{value}</TableCell>
                    </TableRow>
                  ))}
                  {Object.keys(ad.characteristics).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2}>
                        <Typography color="text.secondary">
                          Характеристики не указаны.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>

            <SellerBlock ad={ad} />
          </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <ModerationHistoryBlock history={ad.moderationHistory} />
          </Stack>
        </Grid>
      </Grid>

      <Paper
        variant="outlined"
        sx={{
          position: 'sticky',
          bottom: 0,
          p: 2,
          bgcolor: 'background.paper',
          borderTop: (theme) => `1px solid ${theme.palette.divider}`
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Tooltip title="Горячая клавиша A — одобрить объявление">
              <span>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                  startIcon={<CheckIcon />}
                >
                  Одобрить
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="Горячая клавиша D — отклонить объявление">
              <span>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setRejectOpen(true)}
                  disabled={rejectMutation.isPending}
                  startIcon={<CloseIcon />}
                >
                  Отклонить
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="Вернуть на доработку без отклонения">
              <span>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={handleRequestChanges}
                  disabled={requestChangesMutation.isPending}
                  startIcon={<RefreshIcon />}
                >
                  Доработка
                </Button>
              </span>
            </Tooltip>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Button onClick={handleBackToList} variant="text" startIcon={<ArrowBackIcon />}>
              К списку
            </Button>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Горячая клавиша стрелка влево — предыдущее объявление">
                <span>
                  <Button
                    variant="outlined"
                    disabled={!prevId}
                    component={Link}
                    to={prevId ? `/item/${prevId}` : '#'}
                    state={state}
                    startIcon={<ChevronLeftIcon />}
                  >
                    Пред
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title="Горячая клавиша стрелка вправо — следующее объявление">
                <span>
                  <Button
                    variant="outlined"
                    disabled={!nextId}
                    component={Link}
                    to={nextId ? `/item/${nextId}` : '#'}
                    state={state}
                    endIcon={<ChevronRightIcon />}
                  >
                    След
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      <RejectModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onSubmit={handleReject}
        loading={rejectMutation.isPending}
      />
      <Snackbar
        open={Boolean(hotkeyHint)}
        autoHideDuration={3000}
        onClose={() => setHotkeyHint(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setHotkeyHint(null)}>
          {hotkeyHint}
        </Alert>
      </Snackbar>
    </Stack>
  );
};



