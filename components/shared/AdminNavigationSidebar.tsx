'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationItemDefinition {
  navigationItemLabel: string;
  navigationItemPath: string;
  navigationItemIcon: React.ReactNode;
}

interface AdminNavigationSidebarProperties {
  restaurantTenantName: string;
  restaurantTenantLogoUrl?: string;
}

const adminNavigationItemList: NavigationItemDefinition[] = [
  {
    navigationItemLabel: 'Dashboard',
    navigationItemPath: '/dashboard',
    navigationItemIcon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    navigationItemLabel: 'Staff',
    navigationItemPath: '/staff',
    navigationItemIcon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    navigationItemLabel: 'Menu',
    navigationItemPath: '/menu',
    navigationItemIcon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M3 12h18M3 18h18" />
      </svg>
    ),
  },
  {
    navigationItemLabel: 'Order History',
    navigationItemPath: '/orders',
    navigationItemIcon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
];

export default function AdminNavigationSidebar({
  restaurantTenantName,
  restaurantTenantLogoUrl,
}: AdminNavigationSidebarProperties): React.JSX.Element {
  const currentPathname = usePathname();

  return (
    <aside
      style={{
        width: '240px',
        minHeight: '100vh',
        background: 'var(--nav-surface)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {/* 4px top accent strip */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'var(--tenant-accent)',
        }}
      />

      {/* Logo and restaurant name */}
      <div
        style={{
          padding: '28px 20px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginTop: '4px',
        }}
      >
        {restaurantTenantLogoUrl ? (
          <img
            src={restaurantTenantLogoUrl}
            alt={`${restaurantTenantName} logo`}
            style={{
              width: '32px',
              height: '32px',
              objectFit: 'contain',
              borderRadius: 'var(--radius-sm)',
            }}
          />
        ) : (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--tenant-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '14px',
              fontFamily: 'var(--font-body)',
              flexShrink: 0,
            }}
          >
            {restaurantTenantName.charAt(0).toUpperCase()}
          </div>
        )}
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: '14px',
            color: 'var(--text-inverted)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {restaurantTenantName}
        </span>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: '#2C3D3D', margin: '0 20px 12px' }} />

      {/* Navigation items */}
      <nav style={{ flex: 1, padding: '0 8px' }}>
        {adminNavigationItemList.map((navigationItem) => {
          const isCurrentlyActiveRoute = currentPathname === navigationItem.navigationItemPath ||
            currentPathname.startsWith(navigationItem.navigationItemPath + '/');

          return (
            <Link
              key={navigationItem.navigationItemPath}
              href={navigationItem.navigationItemPath}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '2px',
                textDecoration: 'none',
                color: isCurrentlyActiveRoute
                  ? 'var(--text-inverted)'
                  : 'rgba(247, 248, 246, 0.6)',
                background: isCurrentlyActiveRoute
                  ? 'rgba(30, 107, 107, 0.15)'
                  : 'transparent',
                borderLeft: isCurrentlyActiveRoute
                  ? '3px solid var(--tenant-accent)'
                  : '3px solid transparent',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                fontSize: '14px',
                transition: 'color 120ms, background 120ms',
              }}
            >
              <span
                style={{
                  opacity: isCurrentlyActiveRoute ? 1 : 0.6,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {navigationItem.navigationItemIcon}
              </span>
              {navigationItem.navigationItemLabel}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
