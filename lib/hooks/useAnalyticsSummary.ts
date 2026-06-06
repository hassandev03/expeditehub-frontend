import { useQuery } from '@tanstack/react-query';
import { getAnalyticsSummaryData } from '../api/analyticsApiClient';
import type { AnalyticsSummaryApiResponse } from '../types/analyticsTypes';

export function useAnalyticsSummary() {
  return useQuery<AnalyticsSummaryApiResponse, Error>({
    queryKey: ['analytics', 'summary'],
    queryFn: getAnalyticsSummaryData,
    refetchInterval: 60 * 1000, // Refresh every 60 seconds
  });
}
