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
  const _hasHydrated = useAuthenticationStore(
    (authState) => authState._hasHydrated
  );

  // Auth guard
  useEffect(() => {
    if (!_hasHydrated) return;
    if (!authenticatedEmployee || authenticatedEmployee.role !== 'admin') {
      routerInstance.replace('/login');
    }
  }, [authenticatedEmployee, routerInstance, _hasHydrated]);



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

  if (!_hasHydrated || !authenticatedEmployee || authenticatedEmployee.role !== 'admin') {
    return <div />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <AdminNavigationSidebar
        restaurantTenantName={restaurantTenant?.restaurantTenantName ?? 'ExpediteHub'}
        restaurantTenantLogoUrl={restaurantTenant?.restaurantTenantLogoUrl ?? '/logo.png'}
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
            padding: '12px 32px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface-card)',
            gap: '14px',
          }}
        >
          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--tenant-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '12px',
                flexShrink: 0,
              }}
            >
              {authenticatedEmployee.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}
            >
              {authenticatedEmployee.fullName}
            </span>
          </div>

          <button
            onClick={handleLogoutButtonSelect}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 150ms',
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
