export interface AnalyticsPeriodMetrics {
  revenue: number;
  orders: number;
}

export interface AnalyticsSummaryApiResponse {
  today: AnalyticsPeriodMetrics;
  week:  AnalyticsPeriodMetrics;
  month: AnalyticsPeriodMetrics;
}

export interface AnalyticsCategoryRevenueRecord {
  name: string;
  revenue: number;
}

export interface AnalyticsByCategoryApiResponse {
  categories: AnalyticsCategoryRevenueRecord[];
}

export interface AnalyticsCashierPerformanceRecord {
  cashierId: string;
  fullName: string;
  orders: number;
  revenue: number;
}

export interface AnalyticsByCashierApiResponse {
  cashiers: AnalyticsCashierPerformanceRecord[];
}

export interface AnalyticsChefPerformanceRecord {
  chefId: string;
  fullName: string;
  orders: number;
}

export interface AnalyticsByChefApiResponse {
  chefs: AnalyticsChefPerformanceRecord[];
}

export interface AnalyticsActiveOrdersCountApiResponse {
  count: number;
}
