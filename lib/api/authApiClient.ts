import expediteHubAxiosInstance from './axiosInstance';
import type {
  LoginCredentialsPayload,
  LoginApiResponse,
  RefreshTokenApiResponse,
} from '../types/employeeTypes';
import type { EmployeeRoleValue } from '../types/employeeTypes';

export interface AuthenticatedEmployeeApiShape {
  _id: string;
  fullName: string;
  role: EmployeeRoleValue;
  tenantId: string;
}

export async function postAuthLoginCredentials(
  loginCredentials: LoginCredentialsPayload
): Promise<LoginApiResponse> {
  const apiResponse = await expediteHubAxiosInstance.post<LoginApiResponse>(
    '/auth/login',
    loginCredentials
  );
  return apiResponse.data;
}

export async function postAuthRefreshAccessToken(
  storedRefreshToken: string
): Promise<RefreshTokenApiResponse> {
  const apiResponse = await expediteHubAxiosInstance.post<RefreshTokenApiResponse>(
    '/auth/refresh',
    { refreshToken: storedRefreshToken }
  );
  return apiResponse.data;
}

export async function postAuthLogout(): Promise<void> {
  await expediteHubAxiosInstance.post('/auth/logout');
}
