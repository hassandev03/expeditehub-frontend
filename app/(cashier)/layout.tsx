'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticationStore } from '@/lib/auth/authenticationStore';
import { connectSocketClient, disconnectSocketClient } from '@/lib/socket/socketClient';
import { postAuthLogout } from '@/lib/api/authApiClient';
import PortalTopBar from '@/components/shared/PortalTopBar';
import ToastNotification from '@/components/shared/ToastNotification';

interface CashierPortalLayoutProperties {
  children: React.ReactNode;
}

export default function CashierPortalLayout({
  children,
}: CashierPortalLayoutProperties): React.JSX.Element {
  const routerInstance = useRouter();
  const authenticatedEmployee = useAuthenticationStore(
    (authState) => authState.authenticatedEmployee
  );
  const restaurantTenant = useAuthenticationStore(
    (authState) => authState.restaurantTenant
  );
  const accessToken = useAuthenticationStore((authState) => authState.accessToken);
  const clearAuthenticationSession = useAuthenticationStore(
    (authState) => authState.clearAuthenticationSession
  );
  const _hasHydrated = useAuthenticationStore(
    (authState) => authState._hasHydrated
  );

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!authenticatedEmployee || authenticatedEmployee.role !== 'cashier') {
      routerInstance.replace('/login');
    }
  }, [authenticatedEmployee, routerInstance, _hasHydrated]);

  useEffect(() => {
    const tenantBrandColor = restaurantTenant?.restaurantTenantBrandColor ?? '#1E6B6B';
    document.documentElement.style.setProperty('--tenant-accent', tenantBrandColor);
  }, [restaurantTenant]);

  useEffect(() => {
    if (authenticatedEmployee?.role === 'cashier' && accessToken) {
      connectSocketClient({
        restaurantTenantIdentifier: authenticatedEmployee.tenantId,
        employeeRoleValue: 'cashier',
        employeeAccessToken: accessToken,
      });
    }
    return () => { disconnectSocketClient(); };
  }, [authenticatedEmployee, accessToken]);

  async function handleLogoutButtonSelect(): Promise<void> {
    try { await postAuthLogout(); } catch { /* proceed regardless */ }
    disconnectSocketClient();
    clearAuthenticationSession();
    routerInstance.replace('/login');
  }

  if (!_hasHydrated || !authenticatedEmployee || authenticatedEmployee.role !== 'cashier') {
    return <div />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg-main)',
      }}
    >
      <PortalTopBar
        restaurantTenantName={restaurantTenant?.restaurantTenantName ?? 'ExpediteHub'}
        restaurantTenantLogoUrl={restaurantTenant?.restaurantTenantLogoUrl}
        authenticatedEmployeeFullName={authenticatedEmployee.fullName}
        onLogoutButtonSelect={handleLogoutButtonSelect}
      />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {children}
      </div>
      <ToastNotification />
    </div>
  );
}
