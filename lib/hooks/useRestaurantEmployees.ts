import { useQuery } from '@tanstack/react-query';
import { getRestaurantEmployeeList } from '../api/employeeApiClient';
import type { RestaurantEmployeeRecord } from '../types/employeeTypes';

export function useRestaurantEmployees() {
  return useQuery<{ employees: RestaurantEmployeeRecord[] }, Error>({
    queryKey: ['employees'],
    queryFn: getRestaurantEmployeeList,
  });
}
