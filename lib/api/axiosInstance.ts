import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import type { AuthenticatedEmployeeApiShape } from '@/lib/api/authApiClient';
import type { RestaurantTenantRecord } from '@/lib/types/tenantTypes';

// Lazily imported to avoid circular dependency with the store
let authenticationStoreGetState: (() => {
  accessToken: string | null;
  refreshToken: string | null;
  authenticatedEmployee: AuthenticatedEmployeeApiShape | null;
  restaurantTenant: RestaurantTenantRecord | null;
  setAuthenticationSession: (session: {
    accessToken: string;
    refreshToken: string;
    authenticatedEmployee: AuthenticatedEmployeeApiShape;
    restaurantTenant: RestaurantTenantRecord | null;
  }) => void;
  clearAuthenticationSession: () => void;
}) | null = null;

function getAuthStore() {
  if (!authenticationStoreGetState) {
    // Dynamic require avoids circular import at module load time
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    authenticationStoreGetState = require('@/lib/auth/authenticationStore').useAuthenticationStore.getState;
  }
  return authenticationStoreGetState!();
}

const expediteHubApiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

const expediteHubAxiosInstance: AxiosInstance = axios.create({
  baseURL: `${expediteHubApiBaseUrl}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor: attach Bearer token ───────────────────────────────
expediteHubAxiosInstance.interceptors.request.use(
  (axiosRequestConfiguration: InternalAxiosRequestConfig) => {
    const { accessToken } = getAuthStore();
    if (accessToken) {
      axiosRequestConfiguration.headers.Authorization = `Bearer ${accessToken}`;
    }
    return axiosRequestConfiguration;
  }
);

// ─── Response Interceptor: handle 401 → refresh → retry ────────────────────
let activeTokenRefreshPromise: Promise<string> | null = null;

expediteHubAxiosInstance.interceptors.response.use(
  (successfulResponse) => successfulResponse,
  async (responseError: AxiosError) => {
    const originalFailedRequest = responseError.config as InternalAxiosRequestConfig & {
      _retryAttempted?: boolean;
    };

    if (responseError.response?.status !== 401 || originalFailedRequest._retryAttempted) {
      return Promise.reject(responseError);
    }

    originalFailedRequest._retryAttempted = true;
    const authStore = getAuthStore();
    const storedRefreshToken = authStore.refreshToken;

    if (!storedRefreshToken) {
      authStore.clearAuthenticationSession();
      if (typeof window !== 'undefined') window.location.href = '/login';
      return Promise.reject(responseError);
    }

    // Deduplicate concurrent refresh calls
    if (!activeTokenRefreshPromise) {
      activeTokenRefreshPromise = axios
        .post<{ accessToken: string }>(
          `${expediteHubApiBaseUrl}/api/v1/auth/refresh`,
          { refreshToken: storedRefreshToken }
        )
        .then((refreshApiResponse) => refreshApiResponse.data.accessToken)
        .finally(() => {
          activeTokenRefreshPromise = null;
        });
    }

    try {
      const freshAccessToken = await activeTokenRefreshPromise;
      // Update only the access token in the store, preserving employee/tenant data
      authStore.setAuthenticationSession({
        accessToken: freshAccessToken,
        refreshToken: storedRefreshToken,
        authenticatedEmployee: authStore.authenticatedEmployee as AuthenticatedEmployeeApiShape,
        restaurantTenant: authStore.restaurantTenant,
      });
      if (typeof document !== 'undefined') {
        document.cookie = `accessToken=${freshAccessToken}; path=/; max-age=${15 * 60}`;
      }
      // Patch the auth header and retry the original request
      originalFailedRequest.headers.Authorization = `Bearer ${freshAccessToken}`;
      return expediteHubAxiosInstance(originalFailedRequest);
    } catch {
      authStore.clearAuthenticationSession();
      if (typeof window !== 'undefined') window.location.href = '/login';
      return Promise.reject(responseError);
    }
  }
);

export default expediteHubAxiosInstance;
