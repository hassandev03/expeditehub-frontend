export type OrderStatusValue = 'Received' | 'Preparing' | 'Ready' | 'Paid';

export interface OrderLineItemRecord {
  orderLineItemMenuItemIdentifier: string;  // maps to menuItemId
  orderLineItemName: string;
  orderLineItemPrice: number;
  orderLineItemCategory: string;
  orderLineItemQuantity: number;
}

export interface RestaurantOrderRecord {
  restaurantOrderIdentifier: string;           // maps to _id
  restaurantOrderNumber: number;
  restaurantOrderLineItems: OrderLineItemRecord[];
  restaurantOrderTotalAmount: number;
  restaurantOrderStatus: OrderStatusValue;
  restaurantOrderCashierIdentifier: string;
  restaurantOrderChefIdentifier?: string;
  restaurantOrderCreatedAt: string;
  restaurantOrderUpdatedAt: string;
}

export interface CreateOrderRequestPayload {
  items: Array<{
    menuItemId: string;
    quantity: number;
  }>;
}

export interface UpdateOrderStatusRequestPayload {
  status: 'Preparing' | 'Ready';
}

export interface OrderHistoryQueryParameters {
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedOrderHistoryApiResponse {
  orders: RestaurantOrderRecord[];
  page: number;
  limit: number;
  total: number;
}

/** Cart item used by the cashier local cart state */
export interface CashierCartLineItem {
  cashierCartMenuItemIdentifier: string;
  cashierCartMenuItemName: string;
  cashierCartMenuItemPrice: number;
  cashierCartMenuItemCategory: string;
  cashierCartMenuItemQuantity: number;
}
