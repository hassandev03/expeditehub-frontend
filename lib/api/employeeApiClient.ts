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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBackendEmployee(backendEmployee: any): RestaurantEmployeeRecord {
  return {
    restaurantEmployeeIdentifier: backendEmployee._id,
    restaurantEmployeeFullName: backendEmployee.fullName,
    restaurantEmployeeEmail: backendEmployee.email,
    restaurantEmployeeRole: backendEmployee.role,
    restaurantEmployeeIsActive: backendEmployee.isActive,
    restaurantEmployeeTenantIdentifier: backendEmployee.tenantId,
  };
}

export async function postCreateRestaurantEmployee(
  newEmployeePayload: CreateRestaurantEmployeeRequestPayload
): Promise<{ employee: RestaurantEmployeeRecord }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiResponse = await expediteHubAxiosInstance.post<{ employee: any }>(
    '/employees',
    newEmployeePayload
  );
  return { employee: mapBackendEmployee(apiResponse.data.employee) };
}

export async function getRestaurantEmployeeList(): Promise<{
  employees: RestaurantEmployeeRecord[];
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiResponse = await expediteHubAxiosInstance.get<{
    employees: any[];
  }>('/employees');
  return { employees: apiResponse.data.employees.map(mapBackendEmployee) };
}

export async function getRestaurantEmployeeById(
  restaurantEmployeeIdentifier: string
): Promise<{ employee: RestaurantEmployeeRecord }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiResponse = await expediteHubAxiosInstance.get<{
    employee: any;
  }>(`/employees/${restaurantEmployeeIdentifier}`);
  return { employee: mapBackendEmployee(apiResponse.data.employee) };
}

export async function putUpdateRestaurantEmployee(
  restaurantEmployeeIdentifier: string,
  updateEmployeePayload: UpdateRestaurantEmployeeRequestPayload
): Promise<{ employee: RestaurantEmployeeRecord }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiResponse = await expediteHubAxiosInstance.put<{
    employee: any;
  }>(`/employees/${restaurantEmployeeIdentifier}`, updateEmployeePayload);
  return { employee: mapBackendEmployee(apiResponse.data.employee) };
}

export async function patchDeactivateRestaurantEmployee(
  restaurantEmployeeIdentifier: string
): Promise<{ message: string }> {
  const apiResponse = await expediteHubAxiosInstance.patch<{ message: string }>(
    `/employees/${restaurantEmployeeIdentifier}/deactivate`
  );
  return apiResponse.data;
}
