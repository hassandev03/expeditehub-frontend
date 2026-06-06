export type EmployeeRoleValue = 'admin' | 'chef' | 'cashier';

/** The authenticated employee object returned on login */
export interface AuthenticatedEmployeeRecord {
  authenticatedEmployeeIdentifier: string;   // maps to _id
  authenticatedEmployeeFullName: string;
  authenticatedEmployeeRole: EmployeeRoleValue;
  authenticatedEmployeeTenantIdentifier: string;
}

/** An employee record returned by the employees API */
export interface RestaurantEmployeeRecord {
  restaurantEmployeeIdentifier: string;      // maps to _id
  restaurantEmployeeFullName: string;
  restaurantEmployeeEmail: string;
  restaurantEmployeeRole: EmployeeRoleValue;
  restaurantEmployeeIsActive: boolean;
  restaurantEmployeeTenantIdentifier: string;
}

export interface CreateRestaurantEmployeeRequestPayload {
  fullName: string;
  email: string;
  password: string;
  role: 'chef' | 'cashier';
}

export interface UpdateRestaurantEmployeeRequestPayload {
  fullName?: string;
  role?: 'chef' | 'cashier';
}

export interface LoginCredentialsPayload {
  email: string;
  password: string;
}

export interface LoginApiResponse {
  accessToken: string;
  refreshToken: string;
  employee: {
    _id: string;
    fullName: string;
    role: EmployeeRoleValue;
    tenantId: string;
  };
}

export interface RefreshTokenApiResponse {
  accessToken: string;
}
