export interface RestaurantTenantRecord {
  restaurantTenantIdentifier: string;
  restaurantTenantName: string;
  restaurantTenantAddress: string;
  restaurantTenantCuisineType?: string;
  restaurantTenantLogoUrl?: string;
  restaurantTenantContactEmail: string;
  restaurantTenantContactPhone?: string;
  /** Not in backend spec — injected if present, defaults to #1E6B6B otherwise */
  restaurantTenantBrandColor?: string;
}

export interface TenantRegistrationRequestPayload {
  name: string;
  address: string;
  contactEmail: string;
  adminFullName: string;
  adminEmail: string;
  adminPassword: string;
  cuisineType?: string;
  contactPhone?: string;
  logoUrl?: string;
}

export interface TenantRegistrationApiResponse {
  tenant: {
    _id: string;
    name: string;
    address: string;
    cuisineType?: string;
    logoUrl?: string;
    contactEmail: string;
    contactPhone?: string;
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
  refreshToken: string;
}
