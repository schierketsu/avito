import { httpClient } from './httpClient';
import type {
  StatsSummary,
  ActivityData,
  DecisionsData,
  StatsPeriod
} from './types';

const buildPeriodQuery = (period?: StatsPeriod, startDate?: string, endDate?: string) => {
  const sp = new URLSearchParams();
  if (period) sp.set('period', period);
  if (startDate) sp.set('startDate', startDate);
  if (endDate) sp.set('endDate', endDate);
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
};

export const statsApi = {
  getSummary: async (period?: StatsPeriod, startDate?: string, endDate?: string) => {
    const qs = buildPeriodQuery(period, startDate, endDate);
    const { data } = await httpClient.get<StatsSummary>(`/stats/summary${qs}`);
    return data;
  },

  getActivityChart: async (period?: StatsPeriod, startDate?: string, endDate?: string) => {
    const qs = buildPeriodQuery(period, startDate, endDate);
    const { data } = await httpClient.get<ActivityData[]>(`/stats/chart/activity${qs}`);
    return data;
  },

  getDecisionsChart: async (period?: StatsPeriod, startDate?: string, endDate?: string) => {
    const qs = buildPeriodQuery(period, startDate, endDate);
    const { data } = await httpClient.get<DecisionsData>(`/stats/chart/decisions${qs}`);
    return data;
  },

  getCategoriesChart: async (period?: StatsPeriod, startDate?: string, endDate?: string) => {
    const qs = buildPeriodQuery(period, startDate, endDate);
    const { data } = await httpClient.get<Record<string, number>>(
      `/stats/chart/categories${qs}`
    );
    return data;
  }
};


