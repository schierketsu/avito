import { httpClient } from './httpClient';
import type { AdsListResponse, Advertisement, AdStatus, AdPriority } from './types';

export interface GetAdsParams {
  page?: number;
  limit?: number;
  status?: AdStatus[];
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'createdAt' | 'price' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

const buildQueryString = (params: GetAdsParams) => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.categoryId) searchParams.set('categoryId', String(params.categoryId));
  if (params.minPrice) searchParams.set('minPrice', String(params.minPrice));
  if (params.maxPrice) searchParams.set('maxPrice', String(params.maxPrice));
  if (params.search) searchParams.set('search', params.search);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  if (params.status && params.status.length > 0) {
    for (const s of params.status) {
      searchParams.append('status', s);
    }
  }

  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
};

export const adsApi = {
  getAds: async (params: GetAdsParams = {}): Promise<AdsListResponse> => {
    const qs = buildQueryString(params);
    const { data } = await httpClient.get<AdsListResponse>(`/ads${qs}`);
    return data;
  },

  getAdById: async (id: number): Promise<Advertisement> => {
    const { data } = await httpClient.get<Advertisement>(`/ads/${id}`);
    return data;
  },

  approveAd: async (id: number): Promise<Advertisement> => {
    const { data } = await httpClient.post<{ ad: Advertisement }>(`/ads/${id}/approve`);
    return data.ad;
  },

  rejectAd: async (
    id: number,
    payload: { reason: string; comment?: string }
  ): Promise<Advertisement> => {
    const { data } = await httpClient.post<{ ad: Advertisement }>(`/ads/${id}/reject`, payload);
    return data.ad;
  },

  requestChanges: async (
    id: number,
    payload: { reason: string; comment?: string }
  ): Promise<Advertisement> => {
    const { data } = await httpClient.post<{ ad: Advertisement }>(
      `/ads/${id}/request-changes`,
      payload
    );
    return data.ad;
  }
};


