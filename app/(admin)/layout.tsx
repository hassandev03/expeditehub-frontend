'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticationStore } from '@/lib/auth/authenticationStore';
import { postAuthLogout } from '@/lib/api/authApiClient';
import { disconnectSocketClient } from '@/lib/socket/socketClient';
import AdminNavigationSidebar from '@/components/shared/AdminNavigationSidebar';
import ToastNotification from '@/components/shared/ToastNotification';

interface AdminPortalLayoutProperties {
  children: React.ReactNode;
}

export default function AdminPortalLayout({
  children,
}: AdminPortalLayoutProperties): React.JSX.Element {
  const routerInstance = useRouter();
  const authenticatedEmployee = useAuthenticationStore(
    (authState) => authState.authenticatedEmployee
  );
  const restaurantTenant = useAuthenticationStore(
    (authState) => authState.restaurantTenant
  );
  const clearAuthenticationSession = useAuthenticationStore(
    (authState) => authState.clearAuthenticationSession
  );

  // Auth guard
  useEffect(() => {
    if (!authenticatedEmployee || authenticatedEmployee.role !== 'admin') {
      routerInstance.replace('/login');
    }
  }, [authenticatedEmployee, routerInstance]);

  // Inject tenant accent color
  useEffect(() => {
    const tenantBrandColor = restaurantTenant?.restaurantTenantBrandColor ?? '#1E6B6B';
    document.documentElement.style.setProperty('--tenant-accent', tenantBrandColor);
    // Derive hover state: approximate darkening by adjusting
    document.documentElement.style.setProperty('--tenant-accent-hover', tenantBrandColor);
  }, [restaurantTenant]);

  async function handleLogoutButtonSelect(): Promise<void> {
    try {
      await postAuthLogout();
    } catch {
      // Token may already be expired — proceed with logout regardless
    }
    disconnectSocketClient();
    clearAuthenticationSession();
    routerInstance.replace('/login');
  }

  if (!authenticatedEmployee || authenticatedEmployee.role !== 'admin') {
    return <div />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <AdminNavigationSidebar
        restaurantTenantName={restaurantTenant?.restaurantTenantName ?? 'ExpediteHub'}
        restaurantTenantLogoUrl={restaurantTenant?.restaurantTenantLogoUrl}
      />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        {/* Top bar inside content area */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '16px 32px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface-card)',
            gap: '16px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--text-secondary)',
            }}
          >
            {authenticatedEmployee.fullName}
          </span>
          <button
            onClick={handleLogoutButtonSelect}
            style={{
              padding: '7px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>

        <div style={{ flex: 1, padding: '32px' }}>
          {children}
        </div>
      </div>

      <ToastNotification />
    </div>
  );
}
