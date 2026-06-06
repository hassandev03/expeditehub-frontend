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
        background: 'var(--surface-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
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
            color: 'var(--text-primary)',
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
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          {authenticatedEmployeeFullName}
        </span>
        <button
          onClick={onLogoutButtonSelect}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'var(--surface-secondary)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
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
        >
          Logout
        </button>
      </div>
    </header>
  );
}
