import { useQuery } from '@tanstack/react-query';
import { getActiveKitchenOrderList } from '../api/orderApiClient';
import type { RestaurantOrderRecord } from '../types/orderTypes';

export function useActiveKitchenOrders() {
  return useQuery<{ orders: RestaurantOrderRecord[] }, Error>({
    queryKey: ['orders', 'active'],
    queryFn: getActiveKitchenOrderList,
  });
}
