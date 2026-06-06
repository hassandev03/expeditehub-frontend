import expediteHubAxiosInstance from './axiosInstance';
import type {
  RestaurantMenuItemRecord,
  CreateRestaurantMenuItemRequestPayload,
  UpdateRestaurantMenuItemRequestPayload,
  ToggleMenuItemAvailabilityRequestPayload,
} from '../types/menuItemTypes';

export async function getRestaurantMenuItemList(): Promise<{
  menuItems: RestaurantMenuItemRecord[];
}> {
  const apiResponse = await expediteHubAxiosInstance.get<{
    menuItems: RestaurantMenuItemRecord[];
  }>('/menu-items');
  return apiResponse.data;
}

export async function postCreateRestaurantMenuItem(
  newMenuItemPayload: CreateRestaurantMenuItemRequestPayload
): Promise<{ menuItem: RestaurantMenuItemRecord }> {
  const apiResponse = await expediteHubAxiosInstance.post<{
    menuItem: RestaurantMenuItemRecord;
  }>('/menu-items', newMenuItemPayload);
  return apiResponse.data;
}

export async function putUpdateRestaurantMenuItem(
  restaurantMenuItemIdentifier: string,
  updateMenuItemPayload: UpdateRestaurantMenuItemRequestPayload
): Promise<{ menuItem: RestaurantMenuItemRecord }> {
  const apiResponse = await expediteHubAxiosInstance.put<{
    menuItem: RestaurantMenuItemRecord;
  }>(`/menu-items/${restaurantMenuItemIdentifier}`, updateMenuItemPayload);
  return apiResponse.data;
}

export async function patchToggleRestaurantMenuItemAvailability(
  restaurantMenuItemIdentifier: string,
  availabilityTogglePayload: ToggleMenuItemAvailabilityRequestPayload
): Promise<{ menuItem: RestaurantMenuItemRecord }> {
  const apiResponse = await expediteHubAxiosInstance.patch<{
    menuItem: RestaurantMenuItemRecord;
  }>(`/menu-items/${restaurantMenuItemIdentifier}/availability`, availabilityTogglePayload);
  return apiResponse.data;
}

export async function deleteRestaurantMenuItem(
  restaurantMenuItemIdentifier: string
): Promise<{ message: string }> {
  const apiResponse = await expediteHubAxiosInstance.delete<{ message: string }>(
    `/menu-items/${restaurantMenuItemIdentifier}`
  );
  return apiResponse.data;
}
