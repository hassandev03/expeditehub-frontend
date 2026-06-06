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
        height: '56px',
        background: 'var(--nav-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '4px solid var(--tenant-accent)',
        flexShrink: 0,
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
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: '14px',
            color: 'var(--text-inverted)',
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
            color: 'var(--kds-text-secondary)',
          }}
        >
          {authenticatedEmployeeFullName}
        </span>
        <button
          onClick={onLogoutButtonSelect}
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
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
