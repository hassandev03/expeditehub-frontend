import React from 'react';

interface EmptyStateDisplayProperties {
  emptyStateIconElement: React.ReactNode;
  emptyStateMessage: string;
}

export default function EmptyStateDisplay({
  emptyStateIconElement,
  emptyStateMessage,
}: EmptyStateDisplayProperties): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '48px 24px',
        color: 'var(--text-secondary)',
      }}
    >
      <div style={{ opacity: 0.5 }}>{emptyStateIconElement}</div>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '15px',
          color: 'var(--text-secondary)',
          textAlign: 'center',
        }}
      >
        {emptyStateMessage}
      </p>
    </div>
  );
}
