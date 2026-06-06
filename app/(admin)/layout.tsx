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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-main)' }}>
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
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 32px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface-card)',
          }}
        >
          {/* Left: Tenant Name prominent */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '18px',
                color: 'var(--text-primary)',
                letterSpacing: '-0.2px',
              }}
            >
              {restaurantTenant?.restaurantTenantName ?? 'ExpediteHub'}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--tenant-accent)',
                background: 'color-mix(in srgb, var(--tenant-accent) 10%, transparent)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              Admin Portal
            </span>
          </div>

          {/* Right: Avatar + name + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                {authenticatedEmployee.fullName}
              </span>
            </div>

            <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />

            <button
              onClick={handleLogoutButtonSelect}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 200ms ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--surface-secondary)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <div style={{ flex: 1, padding: '32px' }}>
          {children}
        </div>
      </div>

      <ToastNotification />
    </div>
  );
}
