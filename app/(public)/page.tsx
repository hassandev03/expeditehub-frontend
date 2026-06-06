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
        background: '#FCFAF5',
        color: '#1C1915',
        fontFamily: 'var(--font-body)',
        overflowX: 'hidden',
      }}
    >
      {/* ── Navigation Bar ── */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 48px',
          background: 'rgba(252, 250, 245, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E5E1D8',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="ExpediteHub Logo"
            width={36}
            height={36}
            style={{ borderRadius: 'var(--radius-sm)', objectFit: 'contain' }}
          />
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '22px', color: '#1C1915', letterSpacing: '-0.5px' }}>
            ExpediteHub
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link
            href="/login"
            style={{
              padding: '10px 24px',
              borderRadius: 'var(--radius-md)',
              color: '#4A443B',
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'color 200ms',
            }}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            style={{
              padding: '10px 24px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--tenant-accent)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 4px 12px color-mix(in srgb, var(--tenant-accent) 30%, transparent)',
              transition: 'transform 200ms',
            }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section
        style={{
          padding: '120px 48px 80px',
          maxWidth: '1000px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            borderRadius: 'var(--radius-pill)',
            background: '#FFFFFF',
            border: '1px solid #E5E1D8',
            color: 'var(--tenant-accent)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            marginBottom: '32px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--tenant-accent)', display: 'inline-block' }} />
          Premium Restaurant Operations
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 'clamp(48px, 8vw, 84px)',
            lineHeight: 1.05,
            color: '#1C1915',
            letterSpacing: '-2px',
            marginBottom: '32px',
          }}
        >
          Elevate your kitchen, <br />
          <span style={{ color: 'var(--tenant-accent)', fontStyle: 'italic' }}>perfect the service.</span>
        </h1>

        <p
          style={{
            fontSize: '20px',
            color: '#736B5E',
            maxWidth: '640px',
            margin: '0 auto 56px',
            lineHeight: 1.6,
          }}
        >
          ExpediteHub seamlessly connects your front-of-house with the kitchen. Fast POS ordering, real-time KDS tracking, and deep analytics in one beautiful platform.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/register"
            style={{
              padding: '18px 40px',
              background: 'var(--tenant-accent)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: '16px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 24px color-mix(in srgb, var(--tenant-accent) 35%, transparent)',
            }}
          >
            Open Your Workspace
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Feature Blocks ── */}
      <section
        style={{
          padding: '40px 48px 120px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
          }}
        >
          {portalFeatureCardDataList.map((portalFeatureCard) => (
            <div
              key={portalFeatureCard.portalFeatureCardTitle}
              className="portal-feature-card"
              style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                padding: '48px 40px',
                border: '1px solid #E5E1D8',
                transition: 'all 300ms cubic-bezier(0.2, 0, 0, 1)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.02)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'color-mix(in srgb, var(--tenant-accent) 10%, transparent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '28px',
                  color: 'var(--tenant-accent)',
                }}
              >
                {portalFeatureCard.portalFeatureCardIconElement}
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '24px',
                  color: '#1C1915',
                  marginBottom: '12px',
                  letterSpacing: '-0.3px',
                }}
              >
                {portalFeatureCard.portalFeatureCardTitle}
              </h3>
              <p
                style={{
                  fontSize: '16px',
                  color: '#736B5E',
                  lineHeight: 1.6,
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
          borderTop: '1px solid #E5E1D8',
          padding: '40px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="ExpediteHub Logo" width={24} height={24} style={{ opacity: 0.8 }} />
          <p style={{ fontSize: '14px', color: '#736B5E', fontWeight: 500 }}>
            © {new Date().getFullYear()} ExpediteHub Platform.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '32px' }}>
          <Link href="/login" style={{ fontSize: '14px', color: '#4A443B', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
          <Link href="/register" style={{ fontSize: '14px', color: '#4A443B', fontWeight: 600, textDecoration: 'none' }}>Register</Link>
        </div>
      </footer>
    </main>
  );
}

interface PortalFeatureCardData {
  portalFeatureCardTitle: string;
  portalFeatureCardDescription: string;
  portalFeatureCardIconElement: React.ReactNode;
}

const portalFeatureCardDataList: PortalFeatureCardData[] = [
  {
    portalFeatureCardTitle: 'Admin Portal',
    portalFeatureCardDescription:
      'Manage your menu, staff roster, and view live analytics including revenue breakdowns by category, cashier, and chef performance.',
    portalFeatureCardIconElement: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    portalFeatureCardTitle: 'Cashier POS',
    portalFeatureCardDescription:
      'A fast point-of-sale view with real-time menu updates via sockets. Build orders, track ready tickets, and process payments instantly.',
    portalFeatureCardIconElement: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="3" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    portalFeatureCardTitle: 'Kitchen Display',
    portalFeatureCardDescription:
      'A highly legible Kanban board readable from across a prep station. Orders arrive in real time. Delayed tickets surface immediately.',
    portalFeatureCardIconElement: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
];
