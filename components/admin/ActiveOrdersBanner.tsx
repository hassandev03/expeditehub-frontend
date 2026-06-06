'use client';

import React, { useEffect, useState } from 'react';
import { getAnalyticsActiveOrdersCount } from '@/lib/api/analyticsApiClient';

export default function ActiveOrdersBanner(): React.JSX.Element {
  const [activeOrdersCount, setActiveOrdersCount] = useState<number | null>(null);

  async function fetchActiveOrdersCount(): Promise<void> {
    try {
      const analyticsApiResponse = await getAnalyticsActiveOrdersCount();
      setActiveOrdersCount(analyticsApiResponse.count);
    } catch {
      // Silently fail — this is a live counter, not critical
    }
  }

  useEffect(() => {
    fetchActiveOrdersCount();
    const pollingIntervalId = setInterval(fetchActiveOrdersCount, 30_000);
    return () => clearInterval(pollingIntervalId);
  }, []);

  return (
    <div
      style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-card)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Left: pulsing dot + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          className="pulse-live"
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--status-ready)',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: '12px',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Live Active Orders
        </span>
      </div>

      {/* Right: count */}
      <div
        className="tabular-nums animate-counter-flip"
        key={activeOrdersCount}
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '32px',
          color: 'var(--text-primary)',
          lineHeight: 1,
        }}
      >
        {activeOrdersCount ?? '—'}
      </div>
    </div>
  );
}
