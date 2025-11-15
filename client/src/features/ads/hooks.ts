import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adsApi, GetAdsParams } from '@shared/api/adsApi';
import type { Advertisement } from '@shared/api/types';

const ADS_LIST_KEY = 'ads-list';
const AD_ITEM_KEY = 'ad-item';

export const useAdsList = (params: GetAdsParams) =>
  useQuery({
    queryKey: [ADS_LIST_KEY, params],
    queryFn: () => adsApi.getAds(params),
    keepPreviousData: true
  });

export const useAdItem = (id: number) =>
  useQuery({
    queryKey: [AD_ITEM_KEY, id],
    queryFn: () => adsApi.getAdById(id),
    enabled: Number.isFinite(id)
  });

export const useApproveAd = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adsApi.approveAd(id),
    onSuccess: (updated: Advertisement) => {
      qc.invalidateQueries({ queryKey: [ADS_LIST_KEY] });
      qc.setQueryData<Advertisement | undefined>([AD_ITEM_KEY, updated.id], updated);
    }
  });
};

export const useRejectAd = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: number; reason: string; comment?: string }) =>
      adsApi.rejectAd(params.id, { reason: params.reason, comment: params.comment }),
    onSuccess: (updated: Advertisement) => {
      qc.invalidateQueries({ queryKey: [ADS_LIST_KEY] });
      qc.setQueryData<Advertisement | undefined>([AD_ITEM_KEY, updated.id], updated);
    }
  });
};

export const useRequestChanges = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: number; reason: string; comment?: string }) =>
      adsApi.requestChanges(params.id, { reason: params.reason, comment: params.comment }),
    onSuccess: (updated: Advertisement) => {
      qc.invalidateQueries({ queryKey: [ADS_LIST_KEY] });
      qc.setQueryData<Advertisement | undefined>([AD_ITEM_KEY, updated.id], updated);
    }
  });
};


