import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Stack,
  Typography
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useStatsActivity, useStatsCategories, useStatsDecisions, useStatsSummary } from '@features/stats/hooks';
import type { StatsPeriod } from '@shared/api/types';

const PERIODS: { value: StatsPeriod; label: string }[] = [
  { value: 'today', label: 'Сегодня' },
  { value: 'week', label: '7д' },
  { value: 'month', label: '30д' }
];

const PIE_COLORS = ['#4caf50', '#f44336', '#ff9800'];

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
    activity.forEach((a) => {
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
        <IconButton>
          <CalendarMonthIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="outlined" size="small" onClick={handleExportCsv}>
          Экспорт CSV
        </Button>
        <Button variant="outlined" size="small" onClick={handleExportPdf}>
          PDF-отчёт
        </Button>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Проверено
              </Typography>
              <Typography variant="h5">
                {summary?.totalReviewed ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Одобрено
              </Typography>
              <Typography variant="h5">
                {summary?.approvedPercentage ?? 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Отклонено
              </Typography>
              <Typography variant="h5">
                {summary?.rejectedPercentage ?? 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Ср. время
              </Typography>
              <Typography variant="h5">
                {summary?.averageReviewTime ?? 0} мин
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            📊 График активности (7 дней)
          </Typography>
          <Box sx={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={activity}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="approved" stackId="a" fill="#4caf50" name="Одобрено" />
                <Bar dataKey="rejected" stackId="a" fill="#f44336" name="Отклонено" />
                <Bar dataKey="requestChanges" stackId="a" fill="#ff9800" name="На доработке" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            📊 Распределение решений
          </Typography>
          <Box sx={{ width: '100%', height: 260, display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={decisionsData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {decisionsData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          📊 Категории объявлений
        </Typography>
        <Box sx={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={categoriesList}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2196f3" name="Объявлений" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Stack>
  );
};


