'use client';

import React from 'react';

interface ConfirmationModalProperties {
  confirmationModalTitle: string;
  confirmationModalBodyText: string;
  confirmButtonLabel: string;
  isConfirmationModalVisible: boolean;
  isConfirmationActionPending: boolean;
  onConfirmActionSelect: () => void;
  onCancelActionSelect: () => void;
}

export default function ConfirmationModal({
  confirmationModalTitle,
  confirmationModalBodyText,
  confirmButtonLabel,
  isConfirmationModalVisible,
  isConfirmationActionPending,
  onConfirmActionSelect,
  onCancelActionSelect,
}: ConfirmationModalProperties): React.JSX.Element | null {
  if (!isConfirmationModalVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17, 28, 26, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onCancelActionSelect}
    >
      <div
        className="animate-modal-entrance"
        style={{
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-float)',
          padding: '32px',
          maxWidth: '480px',
          width: '90%',
        }}
        onClick={(mouseEvent) => mouseEvent.stopPropagation()}
      >
        <h2
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '18px',
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}
        >
          {confirmationModalTitle}
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            color: 'var(--text-secondary)',
            marginBottom: '28px',
            lineHeight: '1.6',
          }}
        >
          {confirmationModalBodyText}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancelActionSelect}
            disabled={isConfirmationActionPending}
            style={{
              padding: '0 20px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirmActionSelect}
            disabled={isConfirmationActionPending}
            style={{
              padding: '0 20px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: '#EF4444',
              color: '#FFFFFF',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              fontSize: '14px',
              cursor: isConfirmationActionPending ? 'not-allowed' : 'pointer',
              opacity: isConfirmationActionPending ? 0.7 : 1,
            }}
          >
            {isConfirmationActionPending ? 'Processing…' : confirmButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
