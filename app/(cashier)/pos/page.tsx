'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRestaurantMenuItems } from '@/lib/hooks/useRestaurantMenuItems';
import { postCreateRestaurantOrder, patchMarkRestaurantOrderAsPaid } from '@/lib/api/orderApiClient';
import { getSocketClientInstance } from '@/lib/socket/socketClient';
import type { RestaurantMenuItemRecord } from '@/lib/types/menuItemTypes';
import type { CashierCartLineItem, RestaurantOrderRecord } from '@/lib/types/orderTypes';
import { emitToastNotification } from '@/components/shared/ToastNotification';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';

export default function CashierPosPage(): React.JSX.Element {
  const reactQueryClientInstance = useQueryClient();
  const { data: menuItemListData, isLoading: isMenuItemListLoading } = useRestaurantMenuItems();

  const [selectedCategoryTabValue, setSelectedCategoryTabValue] = useState<string>('All');
  const [cartLineItemList, setCartLineItemList] = useState<CashierCartLineItem[]>([]);
  const [readyOrderList, setReadyOrderList] = useState<{ orderId: string; orderNumber: number }[]>([]);
  const [showMenuUpdateNotificationBar, setShowMenuUpdateNotificationBar] = useState(false);
  const [isPlaceOrderPending, setIsPlaceOrderPending] = useState(false);

  const menuItemList = menuItemListData?.menuItems ?? [];

  // Derive unique category list for tab bar
  const availableCategoryList: string[] = ['All', ...Array.from(
    new Set(menuItemList.map((menuItem) => menuItem.restaurantMenuItemCategory))
  )];

  // Filter menu by selected category
  const filteredMenuItemList = selectedCategoryTabValue === 'All'
    ? menuItemList
    : menuItemList.filter(
        (menuItem) => menuItem.restaurantMenuItemCategory === selectedCategoryTabValue
      );

  // Socket event listeners
  useEffect(() => {
    const socketClientInstance = getSocketClientInstance();
    if (!socketClientInstance) return;

    function handleMenuUpdatedSocketEvent(): void {
      setShowMenuUpdateNotificationBar(true);
    }

    function handleItemUnavailableSocketEvent(socketPayload: {
      menuItemId: string;
      itemName: string;
    }): void {
      reactQueryClientInstance.setQueryData(
        ['menu-items'],
        (previousMenuData: { menuItems: RestaurantMenuItemRecord[] } | undefined) => {
          if (!previousMenuData) return previousMenuData;
          return {
            menuItems: previousMenuData.menuItems.map((menuItemRecord) =>
              menuItemRecord.restaurantMenuItemIdentifier === socketPayload.menuItemId
                ? { ...menuItemRecord, restaurantMenuItemIsAvailable: false }
                : menuItemRecord
            ),
          };
        }
      );
      emitToastNotification(`${socketPayload.itemName} is now unavailable.`, 'warning');
    }

    function handleOrderReadySocketEvent(socketPayload: {
      orderId: string;
      orderNumber: number;
    }): void {
      setReadyOrderList((previousReadyOrderList) => [
        ...previousReadyOrderList,
        { orderId: socketPayload.orderId, orderNumber: socketPayload.orderNumber },
      ]);
    }

    socketClientInstance.on('menu_updated', handleMenuUpdatedSocketEvent);
    socketClientInstance.on('item_unavailable', handleItemUnavailableSocketEvent);
    socketClientInstance.on('order_ready', handleOrderReadySocketEvent);

    return () => {
      socketClientInstance.off('menu_updated', handleMenuUpdatedSocketEvent);
      socketClientInstance.off('item_unavailable', handleItemUnavailableSocketEvent);
      socketClientInstance.off('order_ready', handleOrderReadySocketEvent);
    };
  }, [reactQueryClientInstance]);

  function handleMenuItemCardSelect(selectedMenuItem: RestaurantMenuItemRecord): void {
    if (!selectedMenuItem.restaurantMenuItemIsAvailable) return;

    setCartLineItemList((previousCartList) => {
      const existingCartItem = previousCartList.find(
        (cartItem) =>
          cartItem.cashierCartMenuItemIdentifier === selectedMenuItem.restaurantMenuItemIdentifier
      );

      if (existingCartItem) {
        return previousCartList.map((cartItem) =>
          cartItem.cashierCartMenuItemIdentifier === selectedMenuItem.restaurantMenuItemIdentifier
            ? { ...cartItem, cashierCartMenuItemQuantity: cartItem.cashierCartMenuItemQuantity + 1 }
            : cartItem
        );
      }

      return [
        ...previousCartList,
        {
          cashierCartMenuItemIdentifier: selectedMenuItem.restaurantMenuItemIdentifier,
          cashierCartMenuItemName: selectedMenuItem.restaurantMenuItemName,
          cashierCartMenuItemPrice: selectedMenuItem.restaurantMenuItemPrice,
          cashierCartMenuItemCategory: selectedMenuItem.restaurantMenuItemCategory,
          cashierCartMenuItemQuantity: 1,
        },
      ];
    });
  }

  function handleCartItemQuantityDecrement(cashierCartMenuItemIdentifier: string): void {
    setCartLineItemList((previousCartList) =>
      previousCartList
        .map((cartItem) =>
          cartItem.cashierCartMenuItemIdentifier === cashierCartMenuItemIdentifier
            ? { ...cartItem, cashierCartMenuItemQuantity: cartItem.cashierCartMenuItemQuantity - 1 }
            : cartItem
        )
        .filter((cartItem) => cartItem.cashierCartMenuItemQuantity > 0)
    );
  }

  function handleCartItemQuantityIncrement(cashierCartMenuItemIdentifier: string): void {
    setCartLineItemList((previousCartList) =>
      previousCartList.map((cartItem) =>
        cartItem.cashierCartMenuItemIdentifier === cashierCartMenuItemIdentifier
          ? { ...cartItem, cashierCartMenuItemQuantity: cartItem.cashierCartMenuItemQuantity + 1 }
          : cartItem
      )
    );
  }

  function handleCartItemRemove(cashierCartMenuItemIdentifier: string): void {
    setCartLineItemList((previousCartList) =>
      previousCartList.filter(
        (cartItem) =>
          cartItem.cashierCartMenuItemIdentifier !== cashierCartMenuItemIdentifier
      )
    );
  }

  async function handlePlaceOrderButtonSelect(): Promise<void> {
    if (cartLineItemList.length === 0) return;
    setIsPlaceOrderPending(true);
    try {
      await postCreateRestaurantOrder({
        items: cartLineItemList.map((cartItem) => ({
          menuItemId: cartItem.cashierCartMenuItemIdentifier,
          quantity: cartItem.cashierCartMenuItemQuantity,
        })),
      });
      setCartLineItemList([]);
      emitToastNotification('Order placed successfully!', 'success');
    } catch {
      emitToastNotification('Failed to place order. Please try again.', 'error');
    } finally {
      setIsPlaceOrderPending(false);
    }
  }

  async function handleCollectAndPayButtonSelect(restaurantOrderIdentifier: string): Promise<void> {
    try {
      await patchMarkRestaurantOrderAsPaid(restaurantOrderIdentifier);
      setReadyOrderList((previousReadyOrderList) =>
        previousReadyOrderList.filter(
          (readyOrder) => readyOrder.orderId !== restaurantOrderIdentifier
        )
      );
      emitToastNotification('Order paid and closed.', 'success');
    } catch {
      emitToastNotification('Failed to process payment.', 'error');
    }
  }

  async function handleMenuRefreshButtonSelect(): Promise<void> {
    await reactQueryClientInstance.invalidateQueries({ queryKey: ['menu-items'] });
    setShowMenuUpdateNotificationBar(false);
  }

  const cartSubtotal = cartLineItemList.reduce(
    (runningTotal, cartItem) =>
      runningTotal + cartItem.cashierCartMenuItemPrice * cartItem.cashierCartMenuItemQuantity,
    0
  );

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* ── Left Panel: Menu Browser (62%) ── */}
      <div
        style={{
          flex: '0 0 62%',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        {/* Menu update notification bar */}
        {showMenuUpdateNotificationBar && (
          <div
            style={{
              background: '#F59E0B',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 500, color: '#1C1917' }}>
              Menu prices have been updated.
            </span>
            <button
              onClick={handleMenuRefreshButtonSelect}
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: '#1C1917', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Refresh Menu
            </button>
          </div>
        )}

        {/* Category tab bar */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '14px 20px',
            overflowX: 'auto',
            flexShrink: 0,
            borderBottom: '1px solid var(--border)',
          }}
        >
          {availableCategoryList.map((categoryValue) => (
            <button
              key={categoryValue}
              onClick={() => setSelectedCategoryTabValue(categoryValue)}
              style={{
                height: '40px',
                padding: '0 16px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background:
                  selectedCategoryTabValue === categoryValue
                    ? 'var(--tenant-accent)'
                    : 'var(--surface-secondary)',
                color:
                  selectedCategoryTabValue === categoryValue
                    ? '#FFFFFF'
                    : 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                fontSize: '14px',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background 120ms, color 120ms',
              }}
            >
              {categoryValue}
            </button>
          ))}
        </div>

        {/* Item grid */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
          }}
        >
          {isMenuItemListLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[1, 2, 3, 4, 5, 6].map((skeletonCard) => (
                <LoadingSkeleton key={skeletonCard} skeletonHeight="180px" />
              ))}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '12px',
              }}
            >
              {filteredMenuItemList.map((menuItemRecord) => (
                <button
                  key={menuItemRecord.restaurantMenuItemIdentifier}
                  onClick={() => handleMenuItemCardSelect(menuItemRecord)}
                  disabled={!menuItemRecord.restaurantMenuItemIsAvailable}
                  style={{
                    background: 'var(--surface-card)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-card)',
                    border: 'none',
                    padding: 0,
                    textAlign: 'left',
                    cursor: menuItemRecord.restaurantMenuItemIsAvailable ? 'pointer' : 'not-allowed',
                    opacity: menuItemRecord.restaurantMenuItemIsAvailable ? 1 : 0.45,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 80ms',
                  }}
                >
                  {/* 86'd badge */}
                  {!menuItemRecord.restaurantMenuItemIsAvailable && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: '#EF4444',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)',
                        zIndex: 1,
                      }}
                    >
                      86&apos;d
                    </div>
                  )}

                  {/* Image */}
                  <div
                    style={{
                      aspectRatio: '16/10',
                      background: 'var(--surface-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {menuItemRecord.restaurantMenuItemImageUrl ? (
                      <img
                        src={menuItemRecord.restaurantMenuItemImageUrl}
                        alt={menuItemRecord.restaurantMenuItemName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5">
                        <path d="M12 2v8M8 2v5M16 2v5M8 7c0 2.2 1.8 4 4 4s4-1.8 4-4M12 11v11" />
                      </svg>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '2px' }}>
                      {menuItemRecord.restaurantMenuItemName}
                    </p>
                    <p className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '16px', color: 'var(--tenant-accent)' }}>
                      ₨{menuItemRecord.restaurantMenuItemPrice.toFixed(2)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right Panel: Order Cart (38%) ── */}
      <div
        style={{
          flex: '0 0 38%',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--surface-card)',
          overflow: 'hidden',
        }}
      >
        {/* Cart header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Current Order
          </p>
        </div>

        {/* Ready Orders Queue */}
        {readyOrderList.length > 0 && (
          <div
            style={{
              borderBottom: '1px solid var(--border)',
              padding: '12px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              flexShrink: 0,
            }}
          >
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500, color: 'var(--status-ready)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
              Ready for Pickup
            </p>
            {readyOrderList.map((readyOrderEntry) => (
              <div
                key={readyOrderEntry.orderId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(16, 185, 129, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)' }}>
                    #{readyOrderEntry.orderNumber}
                  </span>
                  <span style={{ background: 'var(--status-ready)', color: '#FFFFFF', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>
                    READY
                  </span>
                </div>
                <button
                  onClick={() => handleCollectAndPayButtonSelect(readyOrderEntry.orderId)}
                  style={{
                    height: '40px', padding: '0 14px',
                    background: 'var(--status-ready)', color: '#FFFFFF',
                    borderRadius: 'var(--radius-md)', border: 'none',
                    fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '13px', cursor: 'pointer',
                  }}
                >
                  Collect & Pay
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Cart line items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {cartLineItemList.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4, marginBottom: '12px' }}>
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
              </svg>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }}>Cart is empty. Tap items to add.</p>
            </div>
          ) : (
            cartLineItemList.map((cartLineItem) => (
              <div
                key={cartLineItem.cashierCartMenuItemIdentifier}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border)',
                  minHeight: '48px',
                }}
              >
                {/* Item name */}
                <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)' }}>
                  {cartLineItem.cashierCartMenuItemName}
                </span>

                {/* Quantity stepper */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleCartItemQuantityDecrement(cartLineItem.cashierCartMenuItemIdentifier)}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}
                  >
                    −
                  </button>
                  <span className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '15px', width: '24px', textAlign: 'center' }}>
                    {cartLineItem.cashierCartMenuItemQuantity}
                  </span>
                  <button
                    onClick={() => handleCartItemQuantityIncrement(cartLineItem.cashierCartMenuItemIdentifier)}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}
                  >
                    +
                  </button>
                </div>

                {/* Line total */}
                <span className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)', minWidth: '64px', textAlign: 'right' }}>
                  ₨{(cartLineItem.cashierCartMenuItemPrice * cartLineItem.cashierCartMenuItemQuantity).toFixed(2)}
                </span>

                {/* Remove */}
                <button
                  onClick={() => handleCartItemRemove(cartLineItem.cashierCartMenuItemIdentifier)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '0 2px' }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text-secondary)' }}>Subtotal</span>
            <span className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '20px', color: 'var(--text-primary)' }}>
              ₨{cartSubtotal.toFixed(2)}
            </span>
          </div>
          <button
            id="place-order-button"
            onClick={handlePlaceOrderButtonSelect}
            disabled={cartLineItemList.length === 0 || isPlaceOrderPending}
            style={{
              width: '100%', height: '52px',
              background: cartLineItemList.length === 0 ? 'var(--border)' : 'var(--tenant-accent)',
              color: cartLineItemList.length === 0 ? 'var(--text-secondary)' : '#FFFFFF',
              borderRadius: 'var(--radius-md)', border: 'none',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '15px',
              cursor: cartLineItemList.length === 0 || isPlaceOrderPending ? 'not-allowed' : 'pointer',
              transition: 'background 120ms',
            }}
          >
            {isPlaceOrderPending ? 'Placing Order…' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
