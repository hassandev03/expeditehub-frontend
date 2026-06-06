import { useQuery } from '@tanstack/react-query';
import { getRestaurantOrderHistory } from '../api/orderApiClient';
import type { PaginatedOrderHistoryApiResponse, OrderHistoryQueryParameters } from '../types/orderTypes';

export function useOrderHistory(queryParameters: OrderHistoryQueryParameters) {
  return useQuery<PaginatedOrderHistoryApiResponse, Error>({
    queryKey: ['orders', 'history', queryParameters],
    queryFn: () => getRestaurantOrderHistory(queryParameters),
  });
}
