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

// Light KDS theme: override --kds-* tokens to warm-light values
// so all child components automatically render in light mode
const kdsLightThemeTokens: React.CSSProperties = {
  ['--kds-bg' as string]:             '#F4F1EC',
  ['--kds-surface' as string]:        '#FFFFFF',
  ['--kds-surface-raised' as string]: '#EBE7E0',
  ['--kds-text-primary' as string]:   '#1C1915',
  ['--kds-text-secondary' as string]: '#6B6560',
  ['--kds-border' as string]:         '#D9D4CC',
};

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
    const tenantBrandColor = restaurantTenant?.restaurantTenantBrandColor ?? '#1B7A6D';
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
        background: '#F4F1EC',
        ...kdsLightThemeTokens,
      }}
    >
      {/* KDS Top Bar — uses nav-surface (same as admin/cashier) for consistency */}
      <header
        style={{
          height: '56px',
          background: 'var(--nav-surface)',
          borderBottom: `4px solid var(--tenant-accent)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        {/* Left: logo + name + role badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/logo.png"
            alt="ExpediteHub Logo"
            style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-md)', objectFit: 'contain' }}
          />
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '15px', color: 'var(--text-inverted)' }}>
            {restaurantTenant?.restaurantTenantName ?? 'ExpediteHub'}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--text-inverted)',
              background: 'rgba(255,255,255,0.12)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill)',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Kitchen
          </span>
        </div>

        {/* Right: clock + chef name + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <LiveClockDisplay />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Chef avatar circle */}
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--tenant-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '11px',
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
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-inverted)', opacity: 0.85 }}>
              {authenticatedEmployee.fullName}
            </span>
          </div>
          <button
            onClick={handleLogoutButtonSelect}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(247, 248, 246, 0.2)',
              background: 'transparent',
              color: 'var(--text-inverted)',
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
      </header>

      {/* Content area with light KDS tokens applied */}
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
        color: 'rgba(247, 248, 246, 0.6)',
        letterSpacing: '0.5px',
      }}
    >
      {currentTimeString}
    </span>
  );
}
