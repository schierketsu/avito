import React from 'react';
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
  Skeleton
} from '@mui/material';
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
      <Typography variant="subtitle1">📷 Галерея (3+)</Typography>
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
        <Typography color="text.secondary">Рейтинг: ⭐ {seller.rating}</Typography>
        <Typography color="text.secondary">Кол-во объявлений: {seller.totalAds}</Typography>
        <Typography color="text.secondary">На сайте: {getTenure(seller.registeredAt)}</Typography>
      </Stack>
    </Paper>
  );
};

const ModerationHistoryBlock: React.FC<{ history: ModerationHistory[] }> = ({ history }) => {
  return (
    <Paper
      sx={{
        p: 2,
        bgcolor: 'warning.light',
        borderColor: 'warning.main'
      }}
      variant="outlined"
    >
      <Typography variant="subtitle1" gutterBottom>
        📄 История модерации
      </Typography>
      <Stack spacing={1.5}>
        {history.map((item) => (
          <Box
            key={item.id}
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'rgba(255,255,255,0.6)'
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography fontWeight={500}>{item.moderatorName}</Typography>
              <Chip label={item.action} size="small" />
              <Typography variant="caption" color="text.secondary">
                {formatDateTime(item.timestamp)}
              </Typography>
            </Stack>
            {item.reason && (
              <Typography variant="body2" mt={0.5}>
                Причина: {item.reason}
              </Typography>
            )}
            {item.comment && (
              <Typography variant="body2" color="text.secondary">
                Комментарий: {item.comment}
              </Typography>
            )}
          </Box>
        ))}
        {history.length === 0 && (
          <Typography color="text.secondary">Пока нет событий модерации для объявления.</Typography>
        )}
      </Stack>
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
                  {Object.entries(ad.characteristics).map(([key, value]) => (
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

      <Stack spacing={2}>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button
            variant="contained"
            color="success"
            onClick={handleApprove}
            disabled={approveMutation.isPending}
          >
            ✓ Одобрить
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => setRejectOpen(true)}
            disabled={rejectMutation.isPending}
          >
            ✗ Отклонить
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleRequestChanges}
            disabled={requestChangesMutation.isPending}
          >
            ↻ Доработка
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <Button onClick={handleBackToList} variant="text">
            ← К списку
          </Button>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              disabled={!prevId}
              component={Link}
              to={prevId ? `/item/${prevId}` : '#'}
              state={state}
            >
              ◄ Пред
            </Button>
            <Button
              variant="outlined"
              disabled={!nextId}
              component={Link}
              to={nextId ? `/item/${nextId}` : '#'}
              state={state}
            >
              След ►
            </Button>
          </Stack>
        </Stack>
      </Stack>

      <RejectModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onSubmit={handleReject}
        loading={rejectMutation.isPending}
      />
    </Stack>
  );
};



