import expediteHubAxiosInstance from './axiosInstance';
import type {
  RestaurantOrderRecord,
  CreateOrderRequestPayload,
  UpdateOrderStatusRequestPayload,
  OrderHistoryQueryParameters,
  PaginatedOrderHistoryApiResponse,
} from '../types/orderTypes';

export async function postCreateRestaurantOrder(
  createOrderPayload: CreateOrderRequestPayload
): Promise<{ order: RestaurantOrderRecord }> {
  const apiResponse = await expediteHubAxiosInstance.post<{ order: RestaurantOrderRecord }>(
    '/orders',
    createOrderPayload
  );
  return apiResponse.data;
}

export async function getActiveKitchenOrderList(): Promise<{
  orders: RestaurantOrderRecord[];
}> {
  const apiResponse = await expediteHubAxiosInstance.get<{ orders: RestaurantOrderRecord[] }>(
    '/orders'
  );
  return apiResponse.data;
}

export async function getRestaurantOrderHistory(
  queryParameters: OrderHistoryQueryParameters
): Promise<PaginatedOrderHistoryApiResponse> {
  const apiResponse = await expediteHubAxiosInstance.get<PaginatedOrderHistoryApiResponse>(
    '/orders/history',
    { params: queryParameters }
  );
  return apiResponse.data;
}

export async function patchUpdateKitchenOrderStatus(
  restaurantOrderIdentifier: string,
  updateStatusPayload: UpdateOrderStatusRequestPayload
): Promise<{ order: RestaurantOrderRecord }> {
  const apiResponse = await expediteHubAxiosInstance.patch<{ order: RestaurantOrderRecord }>(
    `/orders/${restaurantOrderIdentifier}/status`,
    updateStatusPayload
  );
  return apiResponse.data;
}

export async function patchMarkRestaurantOrderAsPaid(
  restaurantOrderIdentifier: string
): Promise<{ message: string; order: RestaurantOrderRecord }> {
  const apiResponse = await expediteHubAxiosInstance.patch<{
    message: string;
    order: RestaurantOrderRecord;
  }>(`/orders/${restaurantOrderIdentifier}/pay`);
  return apiResponse.data;
}
