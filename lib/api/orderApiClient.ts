import expediteHubAxiosInstance from './axiosInstance';
import type {
  RestaurantOrderRecord,
  CreateOrderRequestPayload,
  UpdateOrderStatusRequestPayload,
  OrderHistoryQueryParameters,
  PaginatedOrderHistoryApiResponse,
} from '../types/orderTypes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapBackendOrder(backendOrder: any): RestaurantOrderRecord {
  return {
    restaurantOrderIdentifier: backendOrder._id,
    restaurantOrderNumber: backendOrder.orderNumber,
    restaurantOrderLineItems: (backendOrder.items || []).map((item: any) => ({
      orderLineItemMenuItemIdentifier: item.menuItemId,
      orderLineItemName: item.name,
      orderLineItemPrice: item.price,
      orderLineItemCategory: item.category,
      orderLineItemQuantity: item.quantity,
    })),
    restaurantOrderTotalAmount: backendOrder.totalAmount,
    restaurantOrderStatus: backendOrder.status,
    restaurantOrderCashierIdentifier: backendOrder.cashierId,
    restaurantOrderChefIdentifier: backendOrder.chefId,
    restaurantOrderCreatedAt: backendOrder.createdAt,
    restaurantOrderUpdatedAt: backendOrder.updatedAt,
  };
}

export async function postCreateRestaurantOrder(
  createOrderPayload: CreateOrderRequestPayload
): Promise<{ order: RestaurantOrderRecord }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiResponse = await expediteHubAxiosInstance.post<{ order: any }>(
    '/orders',
    createOrderPayload
  );
  return { order: mapBackendOrder(apiResponse.data.order) };
}

export async function getActiveKitchenOrderList(): Promise<{
  orders: RestaurantOrderRecord[];
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiResponse = await expediteHubAxiosInstance.get<{ orders: any[] }>(
    '/orders'
  );
  return { orders: apiResponse.data.orders.map(mapBackendOrder) };
}

export async function getRestaurantOrderHistory(
  queryParameters: OrderHistoryQueryParameters
): Promise<PaginatedOrderHistoryApiResponse> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiResponse = await expediteHubAxiosInstance.get<any>(
    '/orders/history',
    { params: queryParameters }
  );
  return {
    orders: apiResponse.data.orders.map(mapBackendOrder),
    page: apiResponse.data.page,
    limit: apiResponse.data.limit,
    total: apiResponse.data.total,
  };
}

export async function patchUpdateKitchenOrderStatus(
  restaurantOrderIdentifier: string,
  updateStatusPayload: UpdateOrderStatusRequestPayload
): Promise<{ order: RestaurantOrderRecord }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiResponse = await expediteHubAxiosInstance.patch<{ order: any }>(
    `/orders/${restaurantOrderIdentifier}/status`,
    updateStatusPayload
  );
  return { order: mapBackendOrder(apiResponse.data.order) };
}

export async function patchMarkRestaurantOrderAsPaid(
  restaurantOrderIdentifier: string
): Promise<{ message: string; order: RestaurantOrderRecord }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiResponse = await expediteHubAxiosInstance.patch<{
    message: string;
    order: any;
  }>(`/orders/${restaurantOrderIdentifier}/pay`);
  return {
    message: apiResponse.data.message,
    order: mapBackendOrder(apiResponse.data.order),
  };
}
