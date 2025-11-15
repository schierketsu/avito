import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@shared/api/statsApi';
import type { StatsPeriod } from '@shared/api/types';

const STATS_SUMMARY_KEY = 'stats-summary';
const STATS_ACTIVITY_KEY = 'stats-activity';
const STATS_DECISIONS_KEY = 'stats-decisions';
const STATS_CATEGORIES_KEY = 'stats-categories';

interface StatsParams {
  period: StatsPeriod;
  startDate?: string;
  endDate?: string;
}

export const useStatsSummary = (params: StatsParams) =>
  useQuery({
    queryKey: [STATS_SUMMARY_KEY, params],
    queryFn: () => statsApi.getSummary(params.period, params.startDate, params.endDate)
  });

export const useStatsActivity = (params: StatsParams) =>
  useQuery({
    queryKey: [STATS_ACTIVITY_KEY, params],
    queryFn: () => statsApi.getActivityChart(params.period, params.startDate, params.endDate)
  });

export const useStatsDecisions = (params: StatsParams) =>
  useQuery({
    queryKey: [STATS_DECISIONS_KEY, params],
    queryFn: () => statsApi.getDecisionsChart(params.period, params.startDate, params.endDate)
  });

export const useStatsCategories = (params: StatsParams) =>
  useQuery({
    queryKey: [STATS_CATEGORIES_KEY, params],
    queryFn: () => statsApi.getCategoriesChart(params.period, params.startDate, params.endDate)
  });


