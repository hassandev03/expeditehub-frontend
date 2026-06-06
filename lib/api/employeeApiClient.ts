import expediteHubAxiosInstance from './axiosInstance';
import type {
  RestaurantEmployeeRecord,
  CreateRestaurantEmployeeRequestPayload,
  UpdateRestaurantEmployeeRequestPayload,
} from '../types/employeeTypes';
import type {
  TenantRegistrationRequestPayload,
  TenantRegistrationApiResponse,
} from '../types/tenantTypes';

// ─── Tenant Registration (public — no auth header needed) ────────────────────
export async function postRegisterRestaurantTenant(
  tenantRegistrationPayload: TenantRegistrationRequestPayload
): Promise<TenantRegistrationApiResponse> {
  const apiResponse = await expediteHubAxiosInstance.post<TenantRegistrationApiResponse>(
    '/tenants/register',
    tenantRegistrationPayload
  );
  return apiResponse.data;
}

// ─── Employee CRUD ────────────────────────────────────────────────────────────
export async function postCreateRestaurantEmployee(
  newEmployeePayload: CreateRestaurantEmployeeRequestPayload
): Promise<{ employee: RestaurantEmployeeRecord }> {
  const apiResponse = await expediteHubAxiosInstance.post<{ employee: RestaurantEmployeeRecord }>(
    '/employees',
    newEmployeePayload
  );
  return apiResponse.data;
}

export async function getRestaurantEmployeeList(): Promise<{
  employees: RestaurantEmployeeRecord[];
}> {
  const apiResponse = await expediteHubAxiosInstance.get<{
    employees: RestaurantEmployeeRecord[];
  }>('/employees');
  return apiResponse.data;
}

export async function getRestaurantEmployeeById(
  restaurantEmployeeIdentifier: string
): Promise<{ employee: RestaurantEmployeeRecord }> {
  const apiResponse = await expediteHubAxiosInstance.get<{
    employee: RestaurantEmployeeRecord;
  }>(`/employees/${restaurantEmployeeIdentifier}`);
  return apiResponse.data;
}

export async function putUpdateRestaurantEmployee(
  restaurantEmployeeIdentifier: string,
  updateEmployeePayload: UpdateRestaurantEmployeeRequestPayload
): Promise<{ employee: RestaurantEmployeeRecord }> {
  const apiResponse = await expediteHubAxiosInstance.put<{
    employee: RestaurantEmployeeRecord;
  }>(`/employees/${restaurantEmployeeIdentifier}`, updateEmployeePayload);
  return apiResponse.data;
}

export async function patchDeactivateRestaurantEmployee(
  restaurantEmployeeIdentifier: string
): Promise<{ message: string }> {
  const apiResponse = await expediteHubAxiosInstance.patch<{ message: string }>(
    `/employees/${restaurantEmployeeIdentifier}/deactivate`
  );
  return apiResponse.data;
}
