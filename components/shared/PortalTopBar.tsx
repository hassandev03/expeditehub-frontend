'use client';

import React from 'react';

interface PortalTopBarProperties {
  restaurantTenantName: string;
  restaurantTenantLogoUrl?: string;
  authenticatedEmployeeFullName: string;
  rightSlotContent?: React.ReactNode;
  onLogoutButtonSelect: () => void;
}

export default function PortalTopBar({
  restaurantTenantName,
  restaurantTenantLogoUrl,
  authenticatedEmployeeFullName,
  rightSlotContent,
  onLogoutButtonSelect,
}: PortalTopBarProperties): React.JSX.Element {
  return (
    <header
      style={{
        height: '64px',
        background: 'var(--nav-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        flexShrink: 0,
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
      }}
    >
      {/* Left: logo + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {restaurantTenantLogoUrl ? (
          <img
            src={restaurantTenantLogoUrl}
            alt={`${restaurantTenantName} logo`}
            style={{ height: '28px', maxWidth: '100px', objectFit: 'contain' }}
          />
        ) : (
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--tenant-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '12px',
              fontFamily: 'var(--font-body)',
            }}
          >
            {restaurantTenantName.charAt(0).toUpperCase()}
          </div>
        )}
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '16px',
            color: 'var(--text-inverted)',
            letterSpacing: '0.2px',
          }}
        >
          {restaurantTenantName}
        </span>
      </div>

      {/* Right: slot + employee name + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {rightSlotContent}
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          {authenticatedEmployeeFullName}
        </span>
        <button
          onClick={onLogoutButtonSelect}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-inverted)';
          }}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            background: 'transparent',
            color: 'var(--text-inverted)',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 200ms ease',
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
