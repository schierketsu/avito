import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Stack,
  Typography,
  Tooltip,
  Skeleton
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { Bar as BarChartJS, Pie as PieChartJS } from 'react-chartjs-2';
import { useStatsActivity, useStatsCategories, useStatsDecisions, useStatsSummary } from '@features/stats/hooks';
import type { ActivityData, StatsPeriod } from '@shared/api/types';

const PERIODS: { value: StatsPeriod; label: string }[] = [
  { value: 'today', label: 'Сегодня' },
  { value: 'week', label: '7д' },
  { value: 'month', label: '30д' }
];

// Цвета Авито: зелёный, красный, синий, фиолетовый
const AVITO_GREEN = '#02E161';
const AVITO_RED = '#FF3D52';
const AVITO_BLUE = '#02ABFF';
const AVITO_PURPLE = '#985EEC';

const PIE_COLORS = [AVITO_GREEN, AVITO_RED, AVITO_PURPLE];

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, ChartTooltip, Legend);

export const StatsPage: React.FC = () => {
  const [period, setPeriod] = useState<StatsPeriod>('week');

  const summaryQuery = useStatsSummary({ period });
  const activityQuery = useStatsActivity({ period });
  const decisionsQuery = useStatsDecisions({ period });
  const categoriesQuery = useStatsCategories({ period });

  const summary = summaryQuery.data;
  const activity = activityQuery.data ?? [];
  const decisions = decisionsQuery.data;
  const categories = categoriesQuery.data ?? {};

  const decisionsData = decisions
    ? [
        { name: 'Одобрено', value: decisions.approved },
        { name: 'Отклонено', value: decisions.rejected },
        { name: 'На доработке', value: decisions.requestChanges }
      ]
    : [];

  const categoriesList = Object.entries(categories).map(([name, value]) => ({ name, value }));

  const activityChartData = useMemo(
    () => ({
      labels: activity.map((a) => a.date),
      datasets: [
        {
          label: 'Одобрено',
          data: activity.map((a) => a.approved),
          backgroundColor: AVITO_GREEN,
          stack: 'activity'
        },
        {
          label: 'Отклонено',
          data: activity.map((a) => a.rejected),
          backgroundColor: AVITO_RED,
          stack: 'activity'
        },
        {
          label: 'На доработке',
          data: activity.map((a) => a.requestChanges),
          backgroundColor: AVITO_PURPLE,
          stack: 'activity'
        }
      ]
    }),
    [activity]
  );

  const activityChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false
        }
      },
      interaction: {
        mode: 'index' as const,
        intersect: false
      },
      scales: {
        x: {
          stacked: true
        },
        y: {
          stacked: true,
          beginAtZero: true
        }
      }
    }),
    []
  );

  const decisionsChartData = useMemo(
    () => ({
      labels: decisionsData.map((d) => d.name),
      datasets: [
        {
          data: decisionsData.map((d) => d.value),
          backgroundColor: PIE_COLORS
        }
      ]
    }),
    [decisionsData]
  );

  const categoriesChartData = useMemo(
    () => ({
      labels: categoriesList.map((c) => c.name),
      datasets: [
        {
          label: 'Объявлений',
          data: categoriesList.map((c) => c.value),
          backgroundColor: AVITO_BLUE
        }
      ]
    }),
    [categoriesList]
  );

  const handleExportCsv = () => {
    // Экспорт в формат HTML-таблицы с расширением .xls — Excel открывает
    // и корректно обрабатывает UTF-8 с метой без дополнительных библиотек.
    const escapeHtml = (s: string | number) =>
      String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const rows: string[] = [];
    // Блок метрик
    rows.push(
      `<tr><th style="text-align:left">Метрика</th><th style="text-align:left">Значение</th></tr>`
    );
    if (summary) {
      rows.push(`<tr><td>Проверено</td><td>${escapeHtml(summary.totalReviewed)}</td></tr>`);
      rows.push(`<tr><td>Одобрено</td><td>${escapeHtml(`${summary.approvedPercentage}%`)}</td></tr>`);
      rows.push(`<tr><td>Отклонено</td><td>${escapeHtml(`${summary.rejectedPercentage}%`)}</td></tr>`);
      rows.push(
        `<tr><td>На доработке</td><td>${escapeHtml(`${summary.requestChangesPercentage}%`)}</td></tr>`
      );
      rows.push(
        `<tr><td>Ср. время</td><td>${escapeHtml(`${summary.averageReviewTime} мин`)}</td></tr>`
      );
    }
    // Пустая строка-разделитель
    rows.push(`<tr><td style="height:8px"></td><td></td></tr>`);
    // Блок активности
    rows.push(
      `<tr><th style="text-align:left">Дата</th><th style="text-align:left">Одобрено</th><th style="text-align:left">Отклонено</th><th style="text-align:left">На доработке</th></tr>`
    );
    activity.forEach((a: ActivityData) => {
      rows.push(
        `<tr><td>${escapeHtml(a.date)}</td><td>${escapeHtml(a.approved)}</td><td>${escapeHtml(
          a.rejected
        )}</td><td>${escapeHtml(a.requestChanges)}</td></tr>`
      );
    });

    const html =
      '\uFEFF' +
      `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>moderation-stats</title></head><body><table border="1" cellspacing="0" cellpadding="4">${rows.join(
        ''
      )}</table></body></html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `moderation-stats-${period}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} alignItems="center">
        {PERIODS.map((p) => (
          <Button
            key={p.value}
            variant={p.value === period ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setPeriod(p.value)}
          >
            {p.label}
          </Button>
        ))}
        <Tooltip title="Выбрать произвольный период (необязательно)">
          <IconButton>
            <CalendarMonthIcon />
          </IconButton>
        </Tooltip>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="outlined" size="small" onClick={handleExportCsv}>
          Экспорт CSV статистики
        </Button>
        <Button variant="outlined" size="small" onClick={handleExportPdf}>
          Печать / PDF аналитики
        </Button>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <DoneAllIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" color="text.secondary">
                  Проверено
                </Typography>
              </Stack>
              <Typography variant="h5">
                {summaryQuery.isLoading ? <Skeleton width={40} /> : summary?.totalReviewed ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircleIcon color="success" fontSize="small" />
                <Typography variant="subtitle2" color="text.secondary">
                  Одобрено
                </Typography>
              </Stack>
              <Typography variant="h5">
                {summaryQuery.isLoading ? (
                  <Skeleton width={40} />
                ) : (
                  `${Number(summary?.approvedPercentage ?? 0).toFixed(2)}%`
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <CancelIcon color="error" fontSize="small" />
                <Typography variant="subtitle2" color="text.secondary">
                  Отклонено
                </Typography>
              </Stack>
              <Typography variant="h5">
                {summaryQuery.isLoading ? (
                  <Skeleton width={40} />
                ) : (
                  `${Number(summary?.rejectedPercentage ?? 0).toFixed(2)}%`
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTimeIcon color="secondary" fontSize="small" />
                <Typography variant="subtitle2" color="text.secondary">
                  Ср. время
                </Typography>
              </Stack>
              <Typography variant="h5">
                {summaryQuery.isLoading ? (
                  <Skeleton width={60} />
                ) : (
                  `${summary?.averageReviewTime ?? 0} мин`
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Tooltip title="Сколько объявлений вы проверяли по дням за выбранный период">
            <Typography variant="subtitle1" gutterBottom>
              График активности
            </Typography>
          </Tooltip>
          <Box sx={{ width: '100%', height: 260 }}>
            {activityQuery.isLoading ? (
              <Skeleton variant="rounded" height={260} />
            ) : (
              <BarChartJS data={activityChartData} options={activityChartOptions} />
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Tooltip title="Как распределяются ваши решения: одобрения, отклонения и доработки">
            <Typography variant="subtitle1" gutterBottom>
              Распределение решений
            </Typography>
          </Tooltip>
          <Box sx={{ width: '100%', height: 260, display: 'flex', justifyContent: 'center' }}>
            {decisionsQuery.isLoading ? (
              <Skeleton variant="rounded" height={260} />
            ) : (
              <Box sx={{ width: '100%', maxWidth: 360 }}>
                <PieChartJS
                  data={decisionsChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      <Box>
        <Tooltip title="Распределение проверенных объявлений по категориям">
          <Typography variant="subtitle1" gutterBottom>
            Категории объявлений
          </Typography>
        </Tooltip>
        <Box sx={{ width: '100%', height: 260 }}>
          {categoriesQuery.isLoading ? (
            <Skeleton variant="rounded" height={260} />
          ) : (
            <BarChartJS
              data={categoriesChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false
                  }
                },
                scales: {
                  x: {
                    ticks: {
                      maxRotation: 45,
                      minRotation: 0
                    }
                  },
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          )}
        </Box>
      </Box>
    </Stack>
  );
};


