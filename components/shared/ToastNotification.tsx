'use client';

import React, { useCallback, useEffect, useState } from 'react';

export type ToastVariantValue = 'success' | 'error' | 'warning';

interface ToastNotificationEntry {
  toastEntryIdentifier: string;
  toastEntryMessage: string;
  toastEntryVariant: ToastVariantValue;
  toastEntryIsExiting: boolean;
}

// Global event emitter for triggering toasts from anywhere
type ToastEventListenerCallback = (
  toastMessage: string,
  toastVariant: ToastVariantValue
) => void;

let registeredToastListener: ToastEventListenerCallback | null = null;

export function emitToastNotification(
  toastMessage: string,
  toastVariant: ToastVariantValue = 'success'
): void {
  registeredToastListener?.(toastMessage, toastVariant);
}

const toastVariantLeftBorderColorMap: Record<ToastVariantValue, string> = {
  success: 'var(--tenant-accent)',
  error:   '#EF4444',
  warning: '#F59E0B',
};

export default function ToastNotification(): React.JSX.Element {
  const [activeToastList, setActiveToastList] = useState<ToastNotificationEntry[]>([]);

  const addToastEntry = useCallback(
    (toastMessage: string, toastVariant: ToastVariantValue) => {
      const newToastEntryIdentifier = `toast-${Date.now()}-${Math.random()}`;

      setActiveToastList((previousToastList) => {
        // Cap at 3 toasts max
        const trimmedToastList = previousToastList.slice(-2);
        return [
          ...trimmedToastList,
          {
            toastEntryIdentifier: newToastEntryIdentifier,
            toastEntryMessage: toastMessage,
            toastEntryVariant: toastVariant,
            toastEntryIsExiting: false,
          },
        ];
      });

      // Schedule exit animation then removal
      setTimeout(() => {
        setActiveToastList((previousToastList) =>
          previousToastList.map((toastEntry) =>
            toastEntry.toastEntryIdentifier === newToastEntryIdentifier
              ? { ...toastEntry, toastEntryIsExiting: true }
              : toastEntry
          )
        );
        setTimeout(() => {
          setActiveToastList((previousToastList) =>
            previousToastList.filter(
              (toastEntry) => toastEntry.toastEntryIdentifier !== newToastEntryIdentifier
            )
          );
        }, 200);
      }, 3500);
    },
    []
  );

  useEffect(() => {
    registeredToastListener = addToastEntry;
    return () => {
      registeredToastListener = null;
    };
  }, [addToastEntry]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      {activeToastList.map((toastEntry) => (
        <div
          key={toastEntry.toastEntryIdentifier}
          className={
            toastEntry.toastEntryIsExiting ? 'animate-toast-out' : 'animate-toast-in'
          }
          style={{
            background: 'var(--surface-card)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-float)',
            borderLeft: `4px solid ${toastVariantLeftBorderColorMap[toastEntry.toastEntryVariant]}`,
            padding: '12px 16px',
            minWidth: '280px',
            maxWidth: '360px',
            fontSize: '14px',
            fontFamily: 'var(--font-body)',
            color: 'var(--text-primary)',
            pointerEvents: 'auto',
          }}
        >
          {toastEntry.toastEntryMessage}
        </div>
      ))}
    </div>
  );
}
