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
    const lines: string[] = [];
    lines.push('Метрика,Значение');
    if (summary) {
      lines.push(`Проверено,${summary.totalReviewed}`);
      lines.push(`Одобрено,${summary.approvedPercentage}%`);
      lines.push(`Отклонено,${summary.rejectedPercentage}%`);
      lines.push(`На доработке,${summary.requestChangesPercentage}%`);
      lines.push(`Ср. время,${summary.averageReviewTime} мин`);
    }
    lines.push('');
    lines.push('Дата,Одобрено,Отклонено,На доработке');
    activity.forEach((a: ActivityData) => {
      lines.push(`${a.date},${a.approved},${a.rejected},${a.requestChanges}`);
    });
    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `moderation-stats-${period}.csv`);
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


