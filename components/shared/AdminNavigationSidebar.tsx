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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    navigationItemLabel: 'Staff',
    navigationItemPath: '/staff',
    navigationItemIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v8M8 2v5M16 2v5M8 7c0 2.2 1.8 4 4 4s4-1.8 4-4M12 11v11" />
      </svg>
    ),
  },
  {
    navigationItemLabel: 'Order History',
    navigationItemPath: '/orders',
    navigationItemIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          padding: '24px 20px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '4px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            flexShrink: 0,
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={restaurantTenantLogoUrl ?? '/logo.png'}
            alt={`${restaurantTenantName} logo`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '14px',
              color: 'var(--text-inverted)',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {restaurantTenantName}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 400,
              fontSize: '11px',
              color: 'rgba(247, 248, 246, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}
          >
            Admin Portal
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(247, 248, 246, 0.08)', margin: '0 20px 16px' }} />

      {/* Navigation items */}
      <nav style={{ flex: 1, padding: '0 10px' }}>
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
                  ? '#FFFFFF'
                  : 'rgba(247, 248, 246, 0.55)',
                background: isCurrentlyActiveRoute
                  ? 'rgba(194, 105, 42, 0.18)'
                  : 'transparent',
                borderLeft: isCurrentlyActiveRoute
                  ? '3px solid var(--tenant-accent)'
                  : '3px solid transparent',
                fontFamily: 'var(--font-body)',
                fontWeight: isCurrentlyActiveRoute ? 600 : 400,
                fontSize: '14px',
                transition: 'color 150ms, background 150ms',
              }}
            >
              <span
                style={{
                  opacity: isCurrentlyActiveRoute ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'opacity 150ms',
                  flexShrink: 0,
                }}
              >
                {navigationItem.navigationItemIcon}
              </span>
              {navigationItem.navigationItemLabel}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(247, 248, 246, 0.06)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <img
          src="/logo.png"
          alt="ExpediteHub"
          style={{ width: '16px', height: '16px', objectFit: 'contain', opacity: 0.25 }}
        />
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          color: 'rgba(247, 248, 246, 0.25)',
          letterSpacing: '0.3px',
        }}>
          ExpediteHub
        </p>
      </div>
    </aside>
  );
}
