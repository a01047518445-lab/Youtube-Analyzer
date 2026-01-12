
export interface YouTubeVideo {
  id: string;
  thumbnail: string;
  title: string;
  description: string;
  tags: string[];
  viewCount: number;
  likeCount: number;
  subscriberCount: number;
  publishedAt: string;
  duration: string; // ISO 8601
  durationSec: number;
  channelTitle: string;
  channelId: string;
  vph: number;
  performanceRatio: number;
  influenceLevel: InfluenceLevel;
}

export enum InfluenceLevel {
  VERY_HIGH = '매우 높음',
  HIGH = '높음',
  NORMAL = '보통',
  LOW = '낮음',
  VERY_LOW = '매우 낮음'
}

export interface SearchFilters {
  videoType: 'all' | 'shorts' | 'long';
  dateRange: 'all' | '7d' | '30d' | '90d' | 'custom';
  customDateStart?: string;
  customDateEnd?: string;
  influence: string[];
}

export interface SummaryStats {
  avgViews: number;
  avgVph: number;
  avgPerformanceRatio: number;
  topTags: { tag: string; count: number }[];
  typeRatio: { shorts: number; mid: number; long: number };
  aiAnalysis?: string;
}

export type SortKey = keyof YouTubeVideo;
export type SortOrder = 'asc' | 'desc';
