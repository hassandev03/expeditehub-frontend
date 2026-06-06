'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getActiveKitchenOrderList, patchUpdateKitchenOrderStatus, mapBackendOrder } from '@/lib/api/orderApiClient';
import { getSocketClientInstance } from '@/lib/socket/socketClient';
import { getRestaurantMenuItemList, patchToggleRestaurantMenuItemAvailability } from '@/lib/api/menuItemApiClient';
import type { RestaurantOrderRecord, OrderStatusValue } from '@/lib/types/orderTypes';
import type { RestaurantMenuItemRecord } from '@/lib/types/menuItemTypes';
import { emitToastNotification } from '@/components/shared/ToastNotification';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';

const kdsOrderStatusColumns: OrderStatusValue[] = ['Received', 'Preparing', 'Ready'];

const orderStatusBorderColorMap: Record<OrderStatusValue, string> = {
  Received:  'var(--status-received)',
  Preparing: 'var(--status-preparing)',
  Ready:     'var(--status-ready)',
  Paid:      'var(--status-closed)',
};

const orderStatusColumnCountBadgeColorMap: Record<string, string> = {
  Received:  'var(--status-received)',
  Preparing: 'var(--status-preparing)',
  Ready:     'var(--status-ready)',
};

const columnHeaderAccentColorMap: Record<string, string> = {
  Received:  'rgba(59, 130, 246, 0.12)',
  Preparing: 'rgba(245, 158, 11, 0.12)',
  Ready:     'rgba(16, 185, 129, 0.12)',
};

export default function ChefKdsPage(): React.JSX.Element {
  const { data: initialActiveOrderData, isLoading: isInitialOrderDataLoading } = useQuery({
    queryKey: ['orders', 'active'],
    queryFn: getActiveKitchenOrderList,
  });

  const { data: menuItemListData } = useQuery({
    queryKey: ['menu-items'],
    queryFn: getRestaurantMenuItemList,
  });

  const [kanbanOrderList, setKanbanOrderList] = useState<RestaurantOrderRecord[]>([]);
  const [delayedOrderIdentifierSet, setDelayedOrderIdentifierSet] = useState<Set<string>>(
    new Set()
  );
  const [isEightySixModalOpen, setIsEightySixModalOpen] = useState(false);
  const [statusUpdatePendingOrderIdentifier, setStatusUpdatePendingOrderIdentifier] = useState<string | null>(null);

  // Populate board from initial fetch
  useEffect(() => {
    if (initialActiveOrderData?.orders) {
      setKanbanOrderList(initialActiveOrderData.orders);
    }
  }, [initialActiveOrderData]);

  // Socket event listeners
  useEffect(() => {
    const socketClientInstance = getSocketClientInstance();
    if (!socketClientInstance) return;

    function handleNewOrderSocketEvent(incomingOrderPayload: any): void {
      const mappedOrder = mapBackendOrder(incomingOrderPayload);
      setKanbanOrderList((previousOrderList) => [mappedOrder, ...previousOrderList]);
    }

    function handleOrderDelayedSocketEvent(delayedOrderPayload: { orderId: string }): void {
      setDelayedOrderIdentifierSet((previousDelayedSet) => {
        const updatedDelayedSet = new Set(previousDelayedSet);
        updatedDelayedSet.add(delayedOrderPayload.orderId);
        return updatedDelayedSet;
      });
    }

    socketClientInstance.on('new_order', handleNewOrderSocketEvent);
    socketClientInstance.on('order_delayed', handleOrderDelayedSocketEvent);

    return () => {
      socketClientInstance.off('new_order', handleNewOrderSocketEvent);
      socketClientInstance.off('order_delayed', handleOrderDelayedSocketEvent);
    };
  }, []);

  async function handleOrderStatusAdvanceButtonSelect(
    restaurantOrderIdentifier: string,
    nextOrderStatus: 'Preparing' | 'Ready'
  ): Promise<void> {
    setStatusUpdatePendingOrderIdentifier(restaurantOrderIdentifier);
    try {
      const updatedOrderApiResponse = await patchUpdateKitchenOrderStatus(
        restaurantOrderIdentifier,
        { status: nextOrderStatus }
      );

      setKanbanOrderList((previousOrderList) =>
        previousOrderList.map((orderRecord) =>
          orderRecord.restaurantOrderIdentifier === restaurantOrderIdentifier
            ? updatedOrderApiResponse.order
            : orderRecord
        )
      );
    } catch {
      emitToastNotification('Failed to update order status.', 'error');
    } finally {
      setStatusUpdatePendingOrderIdentifier(null);
    }
  }

  async function handleToggleMenuItemAvailabilityFromModal(
    restaurantMenuItemIdentifier: string
  ): Promise<void> {
    try {
      await patchToggleRestaurantMenuItemAvailability(restaurantMenuItemIdentifier, {
        isAvailable: false,
      });
      emitToastNotification('Item marked unavailable.', 'success');
    } catch {
      emitToastNotification('Failed to mark item unavailable.', 'error');
    }
  }

  const availableMenuItemList = (menuItemListData?.menuItems ?? []).filter(
    (menuItem) => menuItem.restaurantMenuItemIsAvailable
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        background: 'var(--kds-bg)',
      }}
    >
      {/* Sub-header: 86 Item action */}
      <div
        style={{
          padding: '8px 20px',
          borderBottom: '1px solid var(--kds-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          background: 'var(--kds-surface-raised)',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          fontWeight: 500,
          color: 'var(--kds-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
        }}>
          Kitchen Display System
        </span>
        <button
          onClick={() => setIsEightySixModalOpen(true)}
          style={{
            padding: '6px 14px',
            background: 'var(--kds-surface)',
            border: '1px solid var(--kds-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--kds-text-secondary)',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background 150ms, color 150ms',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          86 Item
        </button>
      </div>

      {/* Kanban board */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          overflow: 'hidden',
        }}
      >
        {kdsOrderStatusColumns.map((columnStatusValue, columnIndex) => {
          const columnOrderList = kanbanOrderList.filter(
            (orderRecord) => orderRecord.restaurantOrderStatus === columnStatusValue
          );

          return (
            <div
              key={columnStatusValue}
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRight: columnIndex < 2 ? '1px solid var(--kds-border)' : 'none',
                overflow: 'hidden',
              }}
            >
              {/* Column header */}
              <div
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--kds-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: columnHeaderAccentColorMap[columnStatusValue],
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Status dot */}
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: orderStatusColumnCountBadgeColorMap[columnStatusValue],
                    flexShrink: 0,
                  }} />
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontWeight: 600,
                      fontSize: '12px',
                      color: 'var(--kds-text-primary)',
                      textTransform: 'uppercase',
                      letterSpacing: '1.2px',
                    }}
                  >
                    {columnStatusValue}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '13px',
                    color: '#FFFFFF',
                    background: orderStatusColumnCountBadgeColorMap[columnStatusValue],
                    borderRadius: 'var(--radius-pill)',
                    padding: '2px 8px',
                    minWidth: '24px',
                    textAlign: 'center',
                  }}
                >
                  {columnOrderList.length}
                </span>
              </div>

              {/* Ticket list */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {isInitialOrderDataLoading ? (
                  <>
                    <LoadingSkeleton skeletonHeight="180px" skeletonBorderRadius="var(--radius-md)" />
                    <LoadingSkeleton skeletonHeight="140px" skeletonBorderRadius="var(--radius-md)" />
                  </>
                ) : columnOrderList.length === 0 ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '40px',
                    gap: '10px',
                    opacity: 0.5,
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--kds-text-secondary)" strokeWidth="1.5">
                      {columnStatusValue === 'Ready'
                        ? <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>
                        : columnStatusValue === 'Preparing'
                        ? <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>
                        : <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>
                      }
                    </svg>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--kds-text-secondary)', textAlign: 'center' }}>
                      {columnStatusValue === 'Ready' ? 'All orders clear.' : `No ${columnStatusValue.toLowerCase()} orders.`}
                    </p>
                  </div>
                ) : (
                  columnOrderList.map((orderRecord) => {
                    const isTicketDelayed = delayedOrderIdentifierSet.has(
                      orderRecord.restaurantOrderIdentifier
                    );
                    const ticketBorderColor = isTicketDelayed
                      ? 'var(--status-delayed)'
                      : orderStatusBorderColorMap[orderRecord.restaurantOrderStatus];
                    const isStatusUpdatePending =
                      statusUpdatePendingOrderIdentifier === orderRecord.restaurantOrderIdentifier;

                    return (
                      <KitchenOrderTicket
                        key={orderRecord.restaurantOrderIdentifier}
                        orderRecord={orderRecord}
                        ticketBorderColor={ticketBorderColor}
                        isTicketDelayed={isTicketDelayed}
                        isStatusUpdatePending={isStatusUpdatePending}
                        onAdvanceStatusButtonSelect={handleOrderStatusAdvanceButtonSelect}
                      />
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 86 Item Modal */}
      {isEightySixModalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(28, 25, 18, 0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            backdropFilter: 'blur(2px)',
          }}
          onClick={() => setIsEightySixModalOpen(false)}
        >
          <div
            className="animate-modal-entrance"
            style={{
              background: 'var(--kds-surface)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
              padding: '28px',
              width: '460px',
              maxWidth: '95vw',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid var(--kds-border)',
            }}
            onClick={(mouseEvent) => mouseEvent.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{
                width: '36px', height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239,68,68,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '17px', color: 'var(--kds-text-primary)' }}>
                  Mark Item Unavailable
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--kds-text-secondary)', marginTop: '2px' }}>
                  Item will be 86'd across all active cashier sessions.
                </p>
              </div>
            </div>

            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
              {availableMenuItemList.length === 0 ? (
                <p style={{ color: 'var(--kds-text-secondary)', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
                  No available items.
                </p>
              ) : (
                availableMenuItemList.map((menuItemRecord) => (
                  <div
                    key={menuItemRecord.restaurantMenuItemIdentifier}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--kds-border)',
                      marginBottom: '4px',
                      background: 'var(--kds-surface-raised)',
                    }}
                  >
                    <div>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 500, color: 'var(--kds-text-primary)' }}>
                        {menuItemRecord.restaurantMenuItemName}
                      </span>
                      <span style={{
                        display: 'block',
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        color: 'var(--kds-text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginTop: '2px',
                      }}>
                        {menuItemRecord.restaurantMenuItemCategory}
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleMenuItemAvailabilityFromModal(menuItemRecord.restaurantMenuItemIdentifier)}
                      style={{
                        height: '34px', padding: '0 16px',
                        background: '#EF4444', color: '#FFFFFF',
                        borderRadius: 'var(--radius-md)', border: 'none',
                        fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '12px',
                        cursor: 'pointer',
                        letterSpacing: '0.5px',
                      }}
                    >
                      86 It
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setIsEightySixModalOpen(false)}
              style={{
                marginTop: '16px',
                height: '42px',
                background: 'var(--kds-surface-raised)',
                border: '1px solid var(--kds-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--kds-text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 150ms',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Order Ticket Card ──────────────────────────────────────────────────────
interface KitchenOrderTicketProperties {
  orderRecord: RestaurantOrderRecord;
  ticketBorderColor: string;
  isTicketDelayed: boolean;
  isStatusUpdatePending: boolean;
  onAdvanceStatusButtonSelect: (
    restaurantOrderIdentifier: string,
    nextOrderStatus: 'Preparing' | 'Ready'
  ) => Promise<void>;
}

function KitchenOrderTicket({
  orderRecord,
  ticketBorderColor,
  isTicketDelayed,
  isStatusUpdatePending,
  onAdvanceStatusButtonSelect,
}: KitchenOrderTicketProperties): React.JSX.Element {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const orderCreatedAtTimestamp = new Date(orderRecord.restaurantOrderCreatedAt).getTime();
    function refreshElapsedTime(): void {
      setElapsedSeconds(Math.floor((Date.now() - orderCreatedAtTimestamp) / 1000));
    }
    refreshElapsedTime();
    const timerIntervalId = setInterval(refreshElapsedTime, 1000);
    return () => clearInterval(timerIntervalId);
  }, [orderRecord.restaurantOrderCreatedAt]);

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const remainingSecondsAfterMinutes = elapsedSeconds % 60;
  const elapsedTimeDisplayString = `${String(elapsedMinutes).padStart(2, '0')}:${String(remainingSecondsAfterMinutes).padStart(2, '0')}`;

  const timerTextColor =
    elapsedMinutes >= 15
      ? '#EF4444'
      : elapsedMinutes >= 5
      ? '#F59E0B'
      : 'var(--kds-text-secondary)';

  const nextStatusForButton: 'Preparing' | 'Ready' | null =
    orderRecord.restaurantOrderStatus === 'Received'
      ? 'Preparing'
      : orderRecord.restaurantOrderStatus === 'Preparing'
      ? 'Ready'
      : null;

  const actionButtonLabel =
    orderRecord.restaurantOrderStatus === 'Received'
      ? 'Start Preparing'
      : 'Mark Ready';

  const actionButtonBackgroundColor =
    orderRecord.restaurantOrderStatus === 'Received'
      ? 'var(--tenant-accent)'
      : 'var(--status-ready)';

  return (
    <div
      className="animate-ticket-arrive"
      style={{
        background: 'var(--kds-surface)',
        borderRadius: 'var(--radius-md)',
        borderLeft: `4px solid ${ticketBorderColor}`,
        boxShadow: '0 1px 4px rgba(28, 25, 18, 0.08), 0 4px 12px rgba(28, 25, 18, 0.06)',
        padding: '16px',
        opacity: orderRecord.restaurantOrderStatus === 'Ready' ? 0.85 : 1,
        animation: isTicketDelayed
          ? 'pulse-delayed-border 2s ease-in-out infinite'
          : undefined,
        border: `1px solid var(--kds-border)`,
        borderLeftWidth: '4px',
        borderLeftColor: ticketBorderColor,
      }}
    >
      {/* Header: order number + timer */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className="tabular-nums"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '40px',
              color: 'var(--kds-text-primary)',
              lineHeight: 1,
            }}
          >
            #{orderRecord.restaurantOrderNumber}
          </span>
          {(isTicketDelayed || elapsedMinutes >= 15) && orderRecord.restaurantOrderStatus !== 'Ready' && (
            <span style={{
              background: '#EF4444',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 700,
              padding: '3px 7px',
              borderRadius: 'var(--radius-sm)',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              alignSelf: 'flex-start',
              marginTop: '4px',
            }}>
              LATE
            </span>
          )}
        </div>
        <span
          className="tabular-nums"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '18px',
            color: timerTextColor,
            marginTop: '4px',
            letterSpacing: '0.5px',
          }}
        >
          {elapsedTimeDisplayString}
        </span>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--kds-border)', marginBottom: '12px' }} />

      {/* Item list */}
      <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {orderRecord.restaurantOrderLineItems.map((lineItem, lineItemIndex) => (
          <div
            key={lineItemIndex}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px',
            }}
          >
            <span
              className="tabular-nums"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '15px',
                color: ticketBorderColor,
                minWidth: '24px',
                flexShrink: 0,
              }}
            >
              {lineItem.orderLineItemQuantity}×
            </span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '16px',
                fontWeight: 500,
                color: 'var(--kds-text-primary)',
                lineHeight: 1.3,
              }}
            >
              {lineItem.orderLineItemName}
            </span>
          </div>
        ))}
      </div>

      {/* Action button */}
      {nextStatusForButton && (
        <button
          onClick={() =>
            onAdvanceStatusButtonSelect(
              orderRecord.restaurantOrderIdentifier,
              nextStatusForButton
            )
          }
          disabled={isStatusUpdatePending}
          style={{
            width: '100%',
            height: '46px',
            background: actionButtonBackgroundColor,
            color: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '14px',
            cursor: isStatusUpdatePending ? 'not-allowed' : 'pointer',
            opacity: isStatusUpdatePending ? 0.7 : 1,
            transition: 'opacity 120ms, transform 80ms',
            letterSpacing: '0.3px',
          }}
        >
          {isStatusUpdatePending ? 'Updating…' : actionButtonLabel}
        </button>
      )}

      {/* Ready state: no button, just passive indicator */}
      {orderRecord.restaurantOrderStatus === 'Ready' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '10px',
          background: 'rgba(16, 185, 129, 0.08)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--status-ready)" strokeWidth="2.5">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--status-ready)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Awaiting Pickup
          </span>
        </div>
      )}
    </div>
  );
}
