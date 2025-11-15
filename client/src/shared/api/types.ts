export type AdStatus = 'pending' | 'approved' | 'rejected' | 'draft';
export type AdPriority = 'normal' | 'urgent';

export interface Seller {
  id: number;
  name: string;
  rating: string;
  totalAds: number;
  registeredAt: string;
}

export interface ModerationHistory {
  id: number;
  moderatorId: number;
  moderatorName: string;
  action: 'approved' | 'rejected' | 'requestChanges';
  reason: string | null;
  comment: string;
  timestamp: string;
}

export interface Advertisement {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  categoryId: number;
  status: AdStatus;
  priority: AdPriority;
  createdAt: string;
  updatedAt: string;
  images: string[];
  seller: Seller;
  characteristics: Record<string, string>;
  moderationHistory: ModerationHistory[];
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface AdsListResponse {
  ads: Advertisement[];
  pagination: Pagination;
}

export interface StatsSummary {
  totalReviewed: number;
  totalReviewedToday: number;
  totalReviewedThisWeek: number;
  totalReviewedThisMonth: number;
  approvedPercentage: number;
  rejectedPercentage: number;
  requestChangesPercentage: number;
  averageReviewTime: number;
}

export interface ActivityData {
  date: string;
  approved: number;
  rejected: number;
  requestChanges: number;
}

export interface DecisionsData {
  approved: number;
  rejected: number;
  requestChanges: number;
}

export interface ModeratorStats {
  totalReviewed: number;
  todayReviewed: number;
  thisWeekReviewed: number;
  thisMonthReviewed: number;
  averageReviewTime: number;
  approvalRate: number;
}

export interface Moderator {
  id: number;
  name: string;
  email: string;
  role: string;
  statistics: ModeratorStats;
  permissions: string[];
}

export type StatsPeriod = 'today' | 'week' | 'month' | 'custom';


