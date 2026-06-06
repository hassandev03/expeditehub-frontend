import expediteHubAxiosInstance from './axiosInstance';
import type {
  RestaurantMenuItemRecord,
  CreateRestaurantMenuItemRequestPayload,
  UpdateRestaurantMenuItemRequestPayload,
  ToggleMenuItemAvailabilityRequestPayload,
} from '../types/menuItemTypes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBackendMenuItem(backendMenuItem: any): RestaurantMenuItemRecord {
  return {
    restaurantMenuItemIdentifier: backendMenuItem._id,
    restaurantMenuItemName: backendMenuItem.name,
    restaurantMenuItemDescription: backendMenuItem.description,
    restaurantMenuItemPrice: backendMenuItem.price,
    restaurantMenuItemCategory: backendMenuItem.category,
    restaurantMenuItemIsAvailable: backendMenuItem.isAvailable,
    restaurantMenuItemImageUrl: backendMenuItem.imageUrl,
  };
}

export async function getRestaurantMenuItemList(): Promise<{
  menuItems: RestaurantMenuItemRecord[];
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiResponse = await expediteHubAxiosInstance.get<{
    menuItems: any[];
  }>('/menu-items');
  return { menuItems: apiResponse.data.menuItems.map(mapBackendMenuItem) };
}

export async function postCreateRestaurantMenuItem(
  newMenuItemPayload: CreateRestaurantMenuItemRequestPayload
): Promise<{ menuItem: RestaurantMenuItemRecord }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiResponse = await expediteHubAxiosInstance.post<{
    menuItem: any;
  }>('/menu-items', newMenuItemPayload);
  return { menuItem: mapBackendMenuItem(apiResponse.data.menuItem) };
}

export async function putUpdateRestaurantMenuItem(
  restaurantMenuItemIdentifier: string,
  updateMenuItemPayload: UpdateRestaurantMenuItemRequestPayload
): Promise<{ menuItem: RestaurantMenuItemRecord }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiResponse = await expediteHubAxiosInstance.put<{
    menuItem: any;
  }>(`/menu-items/${restaurantMenuItemIdentifier}`, updateMenuItemPayload);
  return { menuItem: mapBackendMenuItem(apiResponse.data.menuItem) };
}

export async function patchToggleRestaurantMenuItemAvailability(
  restaurantMenuItemIdentifier: string,
  availabilityTogglePayload: ToggleMenuItemAvailabilityRequestPayload
): Promise<{ menuItem: RestaurantMenuItemRecord }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiResponse = await expediteHubAxiosInstance.patch<{
    menuItem: any;
  }>(`/menu-items/${restaurantMenuItemIdentifier}/availability`, availabilityTogglePayload);
  return { menuItem: mapBackendMenuItem(apiResponse.data.menuItem) };
}

export async function deleteRestaurantMenuItem(
  restaurantMenuItemIdentifier: string
): Promise<{ message: string }> {
  const apiResponse = await expediteHubAxiosInstance.delete<{ message: string }>(
    `/menu-items/${restaurantMenuItemIdentifier}`
  );
  return apiResponse.data;
}
