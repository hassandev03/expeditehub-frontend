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
      }}
    >
      {/* 86 Item button in a sub-header */}
      <div
        style={{
          padding: '8px 24px',
          borderBottom: '1px solid var(--kds-border)',
          display: 'flex',
          justifyContent: 'flex-end',
          flexShrink: 0,
        }}
      >
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
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--kds-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'sticky',
                  top: 0,
                  background: 'var(--kds-bg)',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 500,
                    fontSize: '12px',
                    color: 'var(--kds-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  {columnStatusValue}
                </span>
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
                  gap: '12px',
                }}
              >
                {isInitialOrderDataLoading ? (
                  <>
                    <LoadingSkeleton skeletonHeight="180px" skeletonBorderRadius="var(--radius-md)" />
                    <LoadingSkeleton skeletonHeight="140px" skeletonBorderRadius="var(--radius-md)" />
                  </>
                ) : columnOrderList.length === 0 ? (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--kds-text-secondary)', textAlign: 'center', marginTop: '24px' }}>
                    {columnStatusValue === 'Ready' ? 'All orders clear.' : 'No orders.'}
                  </p>
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
            position: 'fixed', inset: 0, background: 'rgba(12, 17, 16, 0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
          onClick={() => setIsEightySixModalOpen(false)}
        >
          <div
            className="animate-modal-entrance"
            style={{
              background: 'var(--kds-surface-raised)', borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-float)', padding: '28px', width: '440px',
              maxWidth: '95vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column',
            }}
            onClick={(mouseEvent) => mouseEvent.stopPropagation()}
          >
            <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '18px', color: 'var(--kds-text-primary)', marginBottom: '20px' }}>
              Mark Item Unavailable
            </h2>
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {availableMenuItemList.length === 0 ? (
                <p style={{ color: 'var(--kds-text-secondary)', fontSize: '14px' }}>No available items.</p>
              ) : (
                availableMenuItemList.map((menuItemRecord) => (
                  <div
                    key={menuItemRecord.restaurantMenuItemIdentifier}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 0', borderBottom: '1px solid var(--kds-border)',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--kds-text-primary)' }}>
                      {menuItemRecord.restaurantMenuItemName}
                    </span>
                    <button
                      onClick={() => handleToggleMenuItemAvailabilityFromModal(menuItemRecord.restaurantMenuItemIdentifier)}
                      style={{
                        height: '32px', padding: '0 14px',
                        background: '#EF4444', color: '#FFFFFF',
                        borderRadius: 'var(--radius-md)', border: 'none',
                        fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '12px', cursor: 'pointer',
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
              style={{ marginTop: '20px', height: '40px', background: 'var(--kds-surface)', border: '1px solid var(--kds-border)', borderRadius: 'var(--radius-md)', color: 'var(--kds-text-secondary)', fontFamily: 'var(--font-body)', fontSize: '14px', cursor: 'pointer' }}
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
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.30)',
        padding: '16px',
        opacity: orderRecord.restaurantOrderStatus === 'Ready' ? 0.85 : 1,
        animation: isTicketDelayed
          ? 'pulse-delayed-border 2s ease-in-out infinite'
          : undefined,
      }}
    >
      {/* Header: order number + timer */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
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
        <span
          className="tabular-nums"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: '16px',
            color: timerTextColor,
            marginTop: '6px',
          }}
        >
          {elapsedTimeDisplayString}
        </span>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--kds-border)', marginBottom: '12px' }} />

      {/* Item list */}
      <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '14px' }}>
        {orderRecord.restaurantOrderLineItems.map((lineItem, lineItemIndex) => (
          <p
            key={lineItemIndex}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              color: 'var(--kds-text-primary)',
              marginBottom: '4px',
            }}
          >
            {lineItem.orderLineItemQuantity}× {lineItem.orderLineItemName}
          </p>
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
            height: '48px',
            background: actionButtonBackgroundColor,
            color: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: '14px',
            cursor: isStatusUpdatePending ? 'not-allowed' : 'pointer',
            opacity: isStatusUpdatePending ? 0.7 : 1,
          }}
        >
          {isStatusUpdatePending ? 'Updating…' : actionButtonLabel}
        </button>
      )}
    </div>
  );
}
