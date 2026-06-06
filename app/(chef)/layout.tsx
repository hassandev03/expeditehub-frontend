'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticationStore } from '@/lib/auth/authenticationStore';
import { connectSocketClient, disconnectSocketClient } from '@/lib/socket/socketClient';
import { postAuthLogout } from '@/lib/api/authApiClient';
import ToastNotification from '@/components/shared/ToastNotification';

interface ChefPortalLayoutProperties {
  children: React.ReactNode;
}

export default function ChefPortalLayout({
  children,
}: ChefPortalLayoutProperties): React.JSX.Element {
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
    if (!authenticatedEmployee || authenticatedEmployee.role !== 'chef') {
      routerInstance.replace('/login');
    }
  }, [authenticatedEmployee, routerInstance, _hasHydrated]);

  useEffect(() => {
    const tenantBrandColor = restaurantTenant?.restaurantTenantBrandColor ?? '#1E6B6B';
    document.documentElement.style.setProperty('--tenant-accent', tenantBrandColor);
  }, [restaurantTenant]);

  useEffect(() => {
    if (authenticatedEmployee?.role === 'chef' && accessToken) {
      connectSocketClient({
        restaurantTenantIdentifier: authenticatedEmployee.tenantId,
        employeeRoleValue: 'chef',
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

  if (!_hasHydrated || !authenticatedEmployee || authenticatedEmployee.role !== 'chef') {
    return <div />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--kds-bg)',
      }}
    >
      {/* KDS Top Bar */}
      <header
        style={{
          height: '56px',
          background: 'var(--kds-surface-raised)',
          borderBottom: `4px solid var(--tenant-accent)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '16px', color: 'var(--kds-text-primary)' }}>
            {restaurantTenant?.restaurantTenantName ?? 'ExpediteHub'}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--kds-text-secondary)' }}>
            Kitchen
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <LiveClockDisplay />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--kds-text-secondary)' }}>
            {authenticatedEmployee.fullName}
          </span>
          <button
            onClick={handleLogoutButtonSelect}
            style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--kds-border)', background: 'transparent', color: 'var(--kds-text-secondary)', fontFamily: 'var(--font-body)', fontSize: '13px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {children}
      </div>

      <ToastNotification />
    </div>
  );
}

function LiveClockDisplay(): React.JSX.Element {
  const [currentTimeString, setCurrentTimeString] = React.useState('');

  React.useEffect(() => {
    function updateClockDisplay(): void {
      setCurrentTimeString(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }
    updateClockDisplay();
    const clockIntervalId = setInterval(updateClockDisplay, 1000);
    return () => clearInterval(clockIntervalId);
  }, []);

  return (
    <span
      className="tabular-nums"
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 500,
        fontSize: '14px',
        color: 'var(--kds-text-secondary)',
      }}
    >
      {currentTimeString}
    </span>
  );
}
