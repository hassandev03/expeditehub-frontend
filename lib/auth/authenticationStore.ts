import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthenticatedEmployeeApiShape } from '../api/authApiClient';
import type { RestaurantTenantRecord } from '../types/tenantTypes';

interface AuthenticationSessionData {
  accessToken: string;
  refreshToken: string;
  authenticatedEmployee: AuthenticatedEmployeeApiShape;
  restaurantTenant: RestaurantTenantRecord | null;
}

interface AuthenticationStoreState {
  accessToken: string | null;
  refreshToken: string | null;
  authenticatedEmployee: AuthenticatedEmployeeApiShape | null;
  restaurantTenant: RestaurantTenantRecord | null;
  setAuthenticationSession: (sessionData: AuthenticationSessionData) => void;
  clearAuthenticationSession: () => void;
}

export const useAuthenticationStore = create<AuthenticationStoreState>()(
  persist(
    (storeSet) => ({
      accessToken: null,
      refreshToken: null,
      authenticatedEmployee: null,
      restaurantTenant: null,

      setAuthenticationSession: (sessionData: AuthenticationSessionData) => {
        storeSet({
          accessToken: sessionData.accessToken,
          refreshToken: sessionData.refreshToken,
          authenticatedEmployee: sessionData.authenticatedEmployee ?? null,
          restaurantTenant: sessionData.restaurantTenant ?? null,
        });
      },

      clearAuthenticationSession: () => {
        storeSet({
          accessToken: null,
          refreshToken: null,
          authenticatedEmployee: null,
          restaurantTenant: null,
        });
        // Remove access token cookie so middleware redirects correctly
        if (typeof document !== 'undefined') {
          document.cookie = 'accessToken=; path=/; max-age=0';
        }
      },
    }),
    {
      name: 'expeditehub-auth-session',
      // Only persist tokens and basic employee info — no sensitive data beyond what's needed
      partialize: (authState) => ({
        accessToken: authState.accessToken,
        refreshToken: authState.refreshToken,
        authenticatedEmployee: authState.authenticatedEmployee,
        restaurantTenant: authState.restaurantTenant,
      }),
    }
  )
);
