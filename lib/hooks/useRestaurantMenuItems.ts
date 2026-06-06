import { useQuery } from '@tanstack/react-query';
import { getRestaurantMenuItemList } from '../api/menuItemApiClient';
import type { RestaurantMenuItemRecord } from '../types/menuItemTypes';

export function useRestaurantMenuItems() {
  return useQuery<{ menuItems: RestaurantMenuItemRecord[] }, Error>({
    queryKey: ['menu-items'],
    queryFn: getRestaurantMenuItemList,
  });
}
