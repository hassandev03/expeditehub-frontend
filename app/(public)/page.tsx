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
        background: 'linear-gradient(160deg, #0A0A0A 0%, #111111 60%, #050505 100%)',
        color: '#EFF4F2',
        fontFamily: 'var(--font-body)',
        overflowX: 'hidden',
      }}
    >
      {/* Grid background overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `linear-gradient(color-mix(in srgb, var(--tenant-accent) 5%, transparent) 1px, transparent 1px),
                            linear-gradient(90deg, color-mix(in srgb, var(--tenant-accent) 5%, transparent) 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Navigation Bar ── */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 48px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="ExpediteHub Logo"
            width={32}
            height={32}
            style={{ borderRadius: 'var(--radius-sm)', objectFit: 'contain' }}
          />
          <span style={{ fontWeight: 700, fontSize: '18px', color: '#FFFFFF', letterSpacing: '-0.3px' }}>
            ExpediteHub
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link
            href="/login"
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.8)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
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
              fontWeight: 600,
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
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 16px',
            borderRadius: 'var(--radius-pill)',
            background: 'color-mix(in srgb, var(--tenant-accent) 15%, transparent)',
            border: '1px solid color-mix(in srgb, var(--tenant-accent) 35%, transparent)',
            color: 'var(--tenant-accent)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '32px',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--tenant-accent)', display: 'inline-block' }} />
          Multi-Tenant Restaurant Platform
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 'clamp(38px, 6vw, 68px)',
            lineHeight: 1.12,
            color: '#FFFFFF',
            letterSpacing: '-1.5px',
            marginBottom: '24px',
          }}
        >
          Your kitchen, orders, and
          <br />
          <span style={{ color: 'var(--tenant-accent)' }}>analytics, synchronized.</span>
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.55)',
            maxWidth: '580px',
            margin: '0 auto 48px',
            lineHeight: 1.7,
          }}
        >
          ExpediteHub connects your admin, cashier, and kitchen in real time.
          Place orders, track prep status, and view live revenue. No page reloads.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/register"
            style={{
              padding: '15px 32px',
              background: 'var(--tenant-accent)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: '15px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              letterSpacing: '0.2px',
            }}
          >
            Register Your Restaurant
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/login"
            style={{
              padding: '15px 32px',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.8)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              fontSize: '15px',
              textDecoration: 'none',
            }}
          >
            Sign In to Portal
          </Link>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        style={{
          padding: '0 48px 80px',
          maxWidth: '900px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginBottom: '10px',
          }}>
            How It Works
          </p>
          <h2 style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: '28px',
            color: '#FFFFFF',
            letterSpacing: '-0.5px',
          }}>
            Three roles. One system.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {howItWorksStepList.map((step, index) => (
            <div
              key={step.stepTitle}
              style={{
                background: '#141414',
                padding: '32px 28px',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '13px',
                  color: 'var(--tenant-accent)',
                  background: 'color-mix(in srgb, var(--tenant-accent) 12%, transparent)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-pill)',
                }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div style={{ height: '1px', flex: 1, background: 'color-mix(in srgb, var(--tenant-accent) 20%, transparent)' }} />
              </div>
              <h3 style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '17px',
                color: '#FFFFFF',
                marginBottom: '10px',
              }}>
                {step.stepTitle}
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.6,
              }}>
                {step.stepDescription}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section
        style={{
          padding: '0 48px 100px',
          maxWidth: '1100px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginBottom: '10px',
          }}>
            Portals
          </p>
          <h2 style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: '28px',
            color: '#FFFFFF',
            letterSpacing: '-0.5px',
          }}>
            Purpose-built for every role.
          </h2>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
          }}
        >
          {portalFeatureCardDataList.map((portalFeatureCard) => (
            <div
              key={portalFeatureCard.portalFeatureCardTitle}
              className="portal-feature-card"
              style={{
                background: '#111111',
                borderRadius: 'var(--radius-lg)',
                padding: '32px',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'transform 200ms ease-out, box-shadow 200ms ease-out, border-color 200ms ease-out',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: 'color-mix(in srgb, var(--tenant-accent) 15%, transparent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  color: 'var(--tenant-accent)',
                }}
              >
                {portalFeatureCard.portalFeatureCardIconElement}
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: '17px',
                  color: '#FFFFFF',
                  marginBottom: '10px',
                }}
              >
                {portalFeatureCard.portalFeatureCardTitle}
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.5)',
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
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '28px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
          © {new Date().getFullYear()} ExpediteHub. Multi-tenant restaurant management.
        </p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/login" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Sign In</Link>
          <Link href="/register" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Register</Link>
        </div>
      </footer>
    </main>
  );
}

interface HowItWorksStepData {
  stepTitle: string;
  stepDescription: string;
}

const howItWorksStepList: HowItWorksStepData[] = [
  {
    stepTitle: 'Cashier takes the order',
    stepDescription: 'The cashier selects items from the live menu on the POS terminal and places the order instantly.',
  },
  {
    stepTitle: 'Kitchen receives and prepares',
    stepDescription: 'The order appears on the KDS in real time. Chefs advance the status as they prepare each ticket.',
  },
  {
    stepTitle: 'Cashier collects payment',
    stepDescription: 'When the kitchen marks an order Ready, the cashier is notified to collect and close the order.',
  },
];

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
      'A warm-light Kanban board readable from across a prep station. Orders arrive in real time. Delayed tickets surface immediately.',
    portalFeatureCardIconElement: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 11l19-9-9 19-2-8-8-2z" />
      </svg>
    ),
  },
];
