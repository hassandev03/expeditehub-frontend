import React from 'react';
import LoadingSkeleton from '../shared/LoadingSkeleton';

interface KpiSummaryCardProperties {
  kpiCardLabel: string;
  kpiCardValue: string;
  kpiCardAccentColor: string;
  kpiCardComparisonText?: string;
  kpiCardIsLoading: boolean;
}

export default function KpiSummaryCard({
  kpiCardLabel,
  kpiCardValue,
  kpiCardAccentColor,
  kpiCardComparisonText,
  kpiCardIsLoading,
}: KpiSummaryCardProperties): React.JSX.Element {
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: '24px',
        flex: 1,
        minWidth: 0,
        borderLeft: `4px solid ${kpiCardAccentColor}`,
        transition: 'box-shadow 200ms',
      }}
    >
      {/* Label row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '2px',
            background: kpiCardAccentColor,
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
          {kpiCardLabel}
        </span>
      </div>

      {/* Value */}
      {kpiCardIsLoading ? (
        <LoadingSkeleton skeletonWidth="120px" skeletonHeight="44px" />
      ) : (
        <div
          className="tabular-nums animate-counter-flip"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '36px',
            color: 'var(--text-primary)',
            lineHeight: 1,
            marginBottom: '8px',
          }}
        >
          {kpiCardValue}
        </div>
      )}

      {/* Comparison */}
      {kpiCardComparisonText && !kpiCardIsLoading && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginTop: '8px',
          }}
        >
          {kpiCardComparisonText}
        </p>
      )}
    </div>
  );
}
