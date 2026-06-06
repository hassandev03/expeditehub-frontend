import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ExpediteHub — Restaurant Management System',
  description:
    'Multi-tenant real-time restaurant management. Kitchen Display System, POS ordering, and analytics — all in one platform.',
};

export default function LandingPage(): React.JSX.Element {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0C1110 0%, #111C1A 50%, #0C1110 100%)',
        color: 'var(--kds-text-primary)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* ── Navigation Bar ── */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 48px',
          borderBottom: '1px solid var(--kds-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'var(--tenant-accent)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '16px',
              color: '#FFFFFF',
            }}
          >
            E
          </div>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '18px',
              color: 'var(--kds-text-primary)',
              letterSpacing: '-0.3px',
            }}
          >
            ExpediteHub
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link
            href="/login"
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--kds-border)',
              color: 'var(--kds-text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'border-color 120ms',
            }}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--tenant-accent)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section
        style={{
          padding: '100px 48px 80px',
          maxWidth: '900px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: 'var(--radius-pill)',
            background: 'rgba(30, 107, 107, 0.2)',
            border: '1px solid rgba(30, 107, 107, 0.4)',
            color: '#4ECDC4',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            marginBottom: '28px',
          }}
        >
          Multi-Tenant Restaurant Platform
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 'clamp(36px, 6vw, 64px)',
            lineHeight: 1.15,
            color: 'var(--kds-text-primary)',
            letterSpacing: '-1px',
            marginBottom: '24px',
          }}
        >
          Your kitchen, orders, and
          <br />
          <span style={{ color: 'var(--tenant-accent)' }}>analytics — synchronized.</span>
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: 'var(--kds-text-secondary)',
            maxWidth: '580px',
            margin: '0 auto 44px',
            lineHeight: 1.7,
          }}
        >
          ExpediteHub connects your admin, cashier, and kitchen in real time.
          Place orders, track prep status, and view live revenue — all without a single page reload.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/register"
            style={{
              padding: '14px 32px',
              background: 'var(--tenant-accent)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '16px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Register Your Restaurant
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/login"
            style={{
              padding: '14px 32px',
              border: '1px solid var(--kds-border)',
              color: 'var(--kds-text-primary)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              fontSize: '16px',
              textDecoration: 'none',
            }}
          >
            Sign In to Portal
          </Link>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section
        style={{
          padding: '0 48px 100px',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {portalFeatureCardDataList.map((portalFeatureCard) => (
            <div
              key={portalFeatureCard.portalFeatureCardTitle}
              style={{
                background: 'var(--kds-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                border: '1px solid var(--kds-border)',
                borderTop: `3px solid ${portalFeatureCard.portalFeatureCardAccentColor}`,
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: `${portalFeatureCard.portalFeatureCardAccentColor}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  color: portalFeatureCard.portalFeatureCardAccentColor,
                }}
              >
                {portalFeatureCard.portalFeatureCardIconElement}
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: '17px',
                  color: 'var(--kds-text-primary)',
                  marginBottom: '10px',
                }}
              >
                {portalFeatureCard.portalFeatureCardTitle}
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--kds-text-secondary)',
                  lineHeight: 1.65,
                }}
              >
                {portalFeatureCard.portalFeatureCardDescription}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: '1px solid var(--kds-border)',
          padding: '24px 48px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <p style={{ fontSize: '13px', color: 'var(--kds-text-secondary)' }}>
          © {new Date().getFullYear()} ExpediteHub. Multi-tenant restaurant management.
        </p>
      </footer>
    </main>
  );
}

interface PortalFeatureCardData {
  portalFeatureCardTitle: string;
  portalFeatureCardDescription: string;
  portalFeatureCardAccentColor: string;
  portalFeatureCardIconElement: React.ReactNode;
}

const portalFeatureCardDataList: PortalFeatureCardData[] = [
  {
    portalFeatureCardTitle: 'Admin Portal',
    portalFeatureCardDescription:
      'Manage your menu, staff roster, and view live analytics including revenue breakdowns by category, cashier, and chef performance.',
    portalFeatureCardAccentColor: 'var(--tenant-accent)',
    portalFeatureCardIconElement: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    portalFeatureCardTitle: 'Cashier POS',
    portalFeatureCardDescription:
      'A fast point-of-sale view with real-time menu updates via sockets. Build orders, track ready tickets, and process payments instantly.',
    portalFeatureCardAccentColor: '#3B82F6',
    portalFeatureCardIconElement: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    portalFeatureCardTitle: 'Kitchen Display',
    portalFeatureCardDescription:
      'A dark-themed Kanban board readable from across a prep station. Orders arrive in real time. Delayed tickets pulse for immediate attention.',
    portalFeatureCardAccentColor: '#10B981',
    portalFeatureCardIconElement: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 11l19-9-9 19-2-8-8-2z" />
      </svg>
    ),
  },
];
