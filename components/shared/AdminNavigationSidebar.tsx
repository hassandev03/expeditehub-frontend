'use client';

import React, { useState } from 'react';
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
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
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
        <path d="M12 2v8M8 2v5M16 2v5M8 7c0 2.2 1.8 4 4 4s4-1.8 4-4M12 11v11" />
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      style={{
        width: isCollapsed ? '80px' : '260px',
        minHeight: '100vh',
        background: 'var(--nav-surface)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'relative',
        transition: 'width 300ms cubic-bezier(0.2, 0, 0, 1)',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: 'absolute',
          right: '-14px',
          top: '32px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          color: 'var(--text-secondary)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          transition: 'transform 300ms, background 150ms',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'var(--surface-secondary)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'var(--surface-card)';
        }}
      >
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{
            transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 300ms cubic-bezier(0.2, 0, 0, 1)',
          }}
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Logo and restaurant name */}
      <div
        style={{
          padding: isCollapsed ? '24px 12px 20px' : '24px 24px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '4px',
          minHeight: '84px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            flexShrink: 0,
            overflow: 'hidden',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: isCollapsed ? '0 auto' : '0',
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
        {!isCollapsed && (
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '16px',
                color: 'var(--text-inverted)',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                letterSpacing: '0.2px',
              }}
            >
              {restaurantTenantName}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '11px',
                color: 'var(--tenant-accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Admin Portal
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255, 0.08)', margin: isCollapsed ? '0 16px 24px' : '0 24px 24px', transition: 'margin 300ms' }} />

      {/* Navigation items */}
      <nav style={{ flex: 1, padding: isCollapsed ? '0 12px' : '0 16px', display: 'flex', flexDirection: 'column', gap: '6px', transition: 'padding 300ms' }}>
        {adminNavigationItemList.map((navigationItem) => {
          const isCurrentlyActiveRoute = currentPathname === navigationItem.navigationItemPath ||
            currentPathname.startsWith(navigationItem.navigationItemPath + '/');

          return (
            <Link
              key={navigationItem.navigationItemPath}
              href={navigationItem.navigationItemPath}
              title={isCollapsed ? navigationItem.navigationItemLabel : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '14px',
                padding: isCollapsed ? '12px 0' : '12px 16px',
                borderRadius: 'var(--radius-lg)',
                textDecoration: 'none',
                color: isCurrentlyActiveRoute
                  ? '#FFFFFF'
                  : 'rgba(255,255,255,0.6)',
                background: isCurrentlyActiveRoute
                  ? 'color-mix(in srgb, var(--tenant-accent) 20%, transparent)'
                  : 'transparent',
                fontFamily: 'var(--font-body)',
                fontWeight: isCurrentlyActiveRoute ? 600 : 500,
                fontSize: '15px',
                letterSpacing: '0.2px',
                transition: 'all 200ms ease-out',
                position: 'relative',
              }}
            >
              {isCurrentlyActiveRoute && !isCollapsed && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '3px',
                  height: '20px',
                  background: 'var(--tenant-accent)',
                  borderRadius: '0 4px 4px 0',
                }} />
              )}
              <span
                style={{
                  color: isCurrentlyActiveRoute ? 'var(--tenant-accent)' : 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 150ms',
                  flexShrink: 0,
                }}
              >
                {navigationItem.navigationItemIcon}
              </span>
              {!isCollapsed && (
                <span style={{ whiteSpace: 'nowrap' }}>
                  {navigationItem.navigationItemLabel}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar footer */}
      <div style={{
        padding: isCollapsed ? '16px 0' : '16px 24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        gap: '10px',
        transition: 'padding 300ms',
      }}>
        <img
          src="/logo.png"
          alt="ExpediteHub"
          style={{ width: '20px', height: '20px', objectFit: 'contain', opacity: 0.3 }}
        />
        {!isCollapsed && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.3)',
            letterSpacing: '0.3px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}>
            ExpediteHub
          </p>
        )}
      </div>
    </aside>
  );
}
