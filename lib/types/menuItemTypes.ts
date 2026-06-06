export interface RestaurantMenuItemRecord {
  restaurantMenuItemIdentifier: string;    // maps to _id
  restaurantMenuItemName: string;
  restaurantMenuItemDescription: string;
  restaurantMenuItemPrice: number;
  restaurantMenuItemCategory: string;
  restaurantMenuItemIsAvailable: boolean;
  restaurantMenuItemImageUrl?: string;
}

export interface CreateRestaurantMenuItemRequestPayload {
  name: string;
  price: number;
  category: string;
  description?: string;
  isAvailable?: boolean;
  imageUrl?: string;
}

export interface UpdateRestaurantMenuItemRequestPayload {
  name?: string;
  price?: number;
  category?: string;
  description?: string;
  isAvailable?: boolean;
  imageUrl?: string;
}

export interface ToggleMenuItemAvailabilityRequestPayload {
  isAvailable: boolean;
}
