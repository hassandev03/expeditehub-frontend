import expediteHubAxiosInstance from './axiosInstance';
import type {
  AnalyticsSummaryApiResponse,
  AnalyticsByCategoryApiResponse,
  AnalyticsByCashierApiResponse,
  AnalyticsByChefApiResponse,
  AnalyticsActiveOrdersCountApiResponse,
} from '../types/analyticsTypes';

export async function getAnalyticsSummaryData(): Promise<AnalyticsSummaryApiResponse> {
  const apiResponse = await expediteHubAxiosInstance.get<AnalyticsSummaryApiResponse>(
    '/analytics/summary'
  );
  return apiResponse.data;
}

export async function getAnalyticsByCategoryData(): Promise<AnalyticsByCategoryApiResponse> {
  const apiResponse = await expediteHubAxiosInstance.get<AnalyticsByCategoryApiResponse>(
    '/analytics/by-category'
  );
  return apiResponse.data;
}

export async function getAnalyticsByCashierData(): Promise<AnalyticsByCashierApiResponse> {
  const apiResponse = await expediteHubAxiosInstance.get<AnalyticsByCashierApiResponse>(
    '/analytics/by-cashier'
  );
  return apiResponse.data;
}

export async function getAnalyticsByChefData(): Promise<AnalyticsByChefApiResponse> {
  const apiResponse = await expediteHubAxiosInstance.get<AnalyticsByChefApiResponse>(
    '/analytics/by-chef'
  );
  return apiResponse.data;
}

export async function getAnalyticsActiveOrdersCount(): Promise<AnalyticsActiveOrdersCountApiResponse> {
  const apiResponse =
    await expediteHubAxiosInstance.get<AnalyticsActiveOrdersCountApiResponse>(
      '/analytics/active-orders-count'
    );
  return apiResponse.data;
}
