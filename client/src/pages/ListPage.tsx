import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  TextField,
  Button,
  Paper,
  Stack,
  Typography,
  Grid,
  Skeleton,
  Pagination,
  Checkbox
} from '@mui/material';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAdsList, useApproveAd, useRejectAd } from '@features/ads/hooks';
import type { Advertisement, AdStatus } from '@shared/api/types';
import { RejectModal } from '@features/ads/RejectModal';

const STATUSES: { value: AdStatus; label: string }[] = [
  { value: 'pending', label: 'На модерации' },
  { value: 'approved', label: 'Одобрено' },
  { value: 'rejected', label: 'Отклонено' },
  { value: 'draft', label: 'Черновик' }
];

const PAGE_SIZE = 10;

const formatPrice = (value: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(
    value
  );

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

const AdCard: React.FC<{
  ad: Advertisement;
  listIds: number[];
  from: string;
  selected: boolean;
  onToggleSelect: () => void;
}> = ({ ad, listIds, from, selected, onToggleSelect }) => {
  const image = ad.images?.[0] ?? 'https://via.placeholder.com/160x120?text=Фото';

  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        gap: 2,
        alignItems: 'stretch'
      }}
      variant="outlined"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 1 }}>
        <Checkbox checked={selected} onChange={onToggleSelect} />
        <Box
          component="img"
          src={image}
          alt={ad.title}
          sx={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 2, bgcolor: 'grey.200' }}
        />
      </Box>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" noWrap>
            {ad.title}
          </Typography>
          <Chip
            label={ad.priority === 'urgent' ? 'Срочно' : 'Обычное'}
            color={ad.priority === 'urgent' ? 'error' : 'default'}
            size="small"
          />
        </Box>
        <Typography variant="subtitle1" color="primary">
          {formatPrice(ad.price)}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip label={ad.category} size="small" />
          <Chip
            label={STATUSES.find((s) => s.value === ad.status)?.label ?? ad.status}
            size="small"
            color={
              ad.status === 'approved'
                ? 'success'
                : ad.status === 'rejected'
                  ? 'error'
                  : ad.status === 'pending'
                    ? 'warning'
                    : 'default'
            }
          />
          <Chip label={formatDate(ad.createdAt)} size="small" variant="outlined" />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Button
          component={Link}
          to={`/item/${ad.id}`}
          state={{ listIds, from }}
          variant="contained"
          endIcon={<span>→</span>}
        >
          Открыть
        </Button>
      </Box>
    </Paper>
  );
};

export const ListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rejectOpen, setRejectOpen] = useState(false);
  const approveMutation = useApproveAd();
  const rejectMutation = useRejectAd();
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  const page = Number(searchParams.get('page') ?? '1') || 1;
  const search = searchParams.get('search') ?? '';
  const categoryId = searchParams.get('categoryId');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const sortBy = (searchParams.get('sortBy') as 'createdAt' | 'price' | 'priority') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
  const statusParams = searchParams.getAll('status') as AdStatus[];

  const { data, isLoading, isError, refetch } = useAdsList({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    categoryId: categoryId ? Number(categoryId) : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sortBy,
    sortOrder,
    status: statusParams.length ? statusParams : undefined
  });

  const categories = useMemo(() => {
    if (!data?.ads) return [];
    const map = new Map<number, string>();
    data.ads.forEach((ad) => {
      if (!map.has(ad.categoryId)) {
        map.set(ad.categoryId, ad.category);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [data]);

  const handleStatusChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as unknown as AdStatus[];
    const next = new URLSearchParams(searchParams);
    next.delete('status');
    value.forEach((v) => next.append('status', v));
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleSimpleField = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleSortChange = (key: 'sortBy' | 'sortOrder', value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set(key, value);
    setSearchParams(next);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    const next = new URLSearchParams();
    next.set('page', '1');
    setSearchParams(next);
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refetch();
    }, 30000);
    return () => window.clearInterval(intervalId);
  }, [refetch]);

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    if (!data?.ads) return;
    if (selectedIds.length === data.ads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.ads.map((a) => a.id));
    }
  };

  const handleBulkApprove = async () => {
    for (const id of selectedIds) {
      // eslint-disable-next-line no-await-in-loop
      await approveMutation.mutateAsync(id);
    }
    setSelectedIds([]);
  };

  const handleBulkReject = () => {
    if (!selectedIds.length) return;
    setRejectOpen(true);
  };

  const handleBulkRejectSubmit = async (payload: { reason: string; comment?: string }) => {
    for (const id of selectedIds) {
      // eslint-disable-next-line no-await-in-loop
      await rejectMutation.mutateAsync({ id, ...payload });
    }
    setSelectedIds([]);
    setRejectOpen(false);
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

      if (event.key === '/') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }

      if (event.key === 'ArrowRight') {
        if (data?.pagination.currentPage && data.pagination.currentPage < data.pagination.totalPages) {
          handlePageChange(event as unknown as React.ChangeEvent<unknown>, page + 1);
        }
      }

      if (event.key === 'ArrowLeft') {
        if (data?.pagination.currentPage && data.pagination.currentPage > 1) {
          handlePageChange(event as unknown as React.ChangeEvent<unknown>, page - 1);
        }
      }

      if (event.key.toLowerCase() === 'a' && selectedIds.length) {
        event.preventDefault();
        void handleBulkApprove();
      }

      if (event.key.toLowerCase() === 'd' && selectedIds.length) {
        event.preventDefault();
        handleBulkReject();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [data?.pagination, page, selectedIds.length]);

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 2 }} variant="outlined">
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="status-label">Статус</InputLabel>
            <Select
              multiple
              labelId="status-label"
              value={statusParams}
              onChange={handleStatusChange}
              input={<OutlinedInput label="Статус" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={STATUSES.find((s) => s.value === value)?.label ?? value}
                      size="small"
                    />
                  ))}
                </Box>
              )}
              size="small"
            >
              {STATUSES.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 180 }} size="small">
            <InputLabel id="category-label">Категория</InputLabel>
            <Select
              labelId="category-label"
              value={categoryId ?? ''}
              label="Категория"
              onChange={(e) => handleSimpleField('categoryId', e.target.value)}
            >
              <MenuItem value="">
                <em>Все</em>
              </MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Цена от"
            size="small"
            type="number"
            value={minPrice ?? ''}
            onChange={(e) => handleSimpleField('minPrice', e.target.value)}
          />
          <TextField
            label="Цена до"
            size="small"
            type="number"
            value={maxPrice ?? ''}
            onChange={(e) => handleSimpleField('maxPrice', e.target.value)}
          />

          <TextField
            label="Поиск по названию"
            size="small"
            value={search}
            onChange={(e) => handleSimpleField('search', e.target.value)}
            sx={{ minWidth: 220 }}
            inputRef={searchInputRef}
          />

          <Button onClick={handleResetFilters} variant="text">
            Сбросить фильтры
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }} variant="outlined">
        <Stack direction="row" spacing={2} mb={2} flexWrap="wrap" alignItems="center">
          <FormControl sx={{ minWidth: 160 }} size="small">
            <InputLabel id="sort-by-label">Сортировка</InputLabel>
            <Select
              labelId="sort-by-label"
              value={sortBy}
              label="Сортировка"
              onChange={(e) =>
                handleSortChange('sortBy', e.target.value as 'createdAt' | 'price' | 'priority')
              }
            >
              <MenuItem value="createdAt">По дате создания</MenuItem>
              <MenuItem value="price">По цене</MenuItem>
              <MenuItem value="priority">По приоритету</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 140 }} size="small">
            <InputLabel id="sort-order-label">Порядок</InputLabel>
            <Select
              labelId="sort-order-label"
              value={sortOrder}
              label="Порядок"
              onChange={(e) => handleSortChange('sortOrder', e.target.value as 'asc' | 'desc')}
            >
              <MenuItem value="desc">По убыванию</MenuItem>
              <MenuItem value="asc">По возрастанию</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ flexGrow: 1 }} />

          <Button
            variant="outlined"
            size="small"
            onClick={handleSelectAll}
            disabled={!data?.ads.length}
          >
            {data && selectedIds.length === data.ads.length
              ? 'Снять выделение'
              : 'Выбрать все на странице'}
          </Button>
          <Typography variant="body2" color="text.secondary">
            Выбрано: {selectedIds.length}
          </Typography>
          <Button
            variant="contained"
            size="small"
            color="success"
            onClick={handleBulkApprove}
            disabled={!selectedIds.length || approveMutation.isPending}
          >
            Массовое одобрение
          </Button>
          <Button
            variant="contained"
            size="small"
            color="error"
            onClick={handleBulkReject}
            disabled={!selectedIds.length || rejectMutation.isPending}
          >
            Массовое отклонение
          </Button>
          <Button variant="text" size="small" onClick={() => void refetch()}>
            Обновить
          </Button>
        </Stack>

        {isLoading && (
          <Grid container spacing={2}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <Grid item xs={12} key={idx}>
                <Skeleton variant="rounded" height={140} />
              </Grid>
            ))}
          </Grid>
        )}

        {isError && !isLoading && (
          <Typography color="error" sx={{ my: 2 }}>
            Не удалось загрузить объявления. Попробуйте обновить страницу.
          </Typography>
        )}

        {!isLoading && data && (
          <Stack spacing={2}>
            {data.ads.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                listIds={data.ads.map((a) => a.id)}
                from={`${location.pathname}?${searchParams.toString()}`}
                selected={selectedIds.includes(ad.id)}
                onToggleSelect={() => toggleSelected(ad.id)}
              />
            ))}
            {data.ads.length === 0 && (
              <Typography color="text.secondary">Объявления по данным фильтрам не найдены.</Typography>
            )}
          </Stack>
        )}
      </Paper>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Pagination
          count={data?.pagination.totalPages ?? 1}
          page={data?.pagination.currentPage ?? page}
          onChange={handlePageChange}
          color="primary"
        />
        <Typography color="text.secondary">
          Всего: {data?.pagination.totalItems ?? 0} объявлений
        </Typography>
      </Box>

      <RejectModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onSubmit={handleBulkRejectSubmit}
        loading={rejectMutation.isPending}
      />
    </Stack>
  );
};



