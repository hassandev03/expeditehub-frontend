'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRestaurantMenuItems } from '@/lib/hooks/useRestaurantMenuItems';
import { postCreateRestaurantOrder, patchMarkRestaurantOrderAsPaid, getActiveKitchenOrderList } from '@/lib/api/orderApiClient';
import { getSocketClientInstance } from '@/lib/socket/socketClient';
import type { RestaurantMenuItemRecord } from '@/lib/types/menuItemTypes';
import type { CashierCartLineItem } from '@/lib/types/orderTypes';
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

  // Hover-expand state for menu item cards
  const expandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const { data: activeOrderData } = useQuery({
    queryKey: ['orders', 'active'],
    queryFn: getActiveKitchenOrderList,
  });

  useEffect(() => {
    if (activeOrderData?.orders) {
      const readyOrders = activeOrderData.orders
        .filter((order) => order.restaurantOrderStatus === 'Ready')
        .map((order) => ({
          orderId: order.restaurantOrderIdentifier,
          orderNumber: order.restaurantOrderNumber,
        }));
      setReadyOrderList(readyOrders);
    }
  }, [activeOrderData]);

  // Derive kitchen status counts for the 3-status panel
  const allActiveOrders = activeOrderData?.orders ?? [];
  const kitchenStatusCounts = {
    Received: allActiveOrders.filter((o) => o.restaurantOrderStatus === 'Received').length,
    Preparing: allActiveOrders.filter((o) => o.restaurantOrderStatus === 'Preparing').length,
    Ready: readyOrderList.length,
  };

  const menuItemList = menuItemListData?.menuItems ?? [];

  const availableCategoryList: string[] = ['All', ...Array.from(
    new Set(menuItemList.map((menuItem) => menuItem.restaurantMenuItemCategory))
  )];

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

  // Hover-expand handlers (1s delay before expanding)
  function handleMenuItemHoverStart(itemId: string): void {
    if (expandTimerRef.current) clearTimeout(expandTimerRef.current);
    expandTimerRef.current = setTimeout(() => setExpandedItemId(itemId), 900);
  }

  function handleMenuItemHoverEnd(): void {
    if (expandTimerRef.current) clearTimeout(expandTimerRef.current);
    expandTimerRef.current = null;
    setExpandedItemId(null);
  }

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

  const totalActiveOrders = kitchenStatusCounts.Received + kitchenStatusCounts.Preparing + kitchenStatusCounts.Ready;

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
              background: '#FFFBEB',
              borderBottom: '1px solid #F59E0B',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="#F59E0B"/>
              </svg>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: '#92400E' }}>
                Menu prices have been updated.
              </span>
            </div>
            <button
              onClick={handleMenuRefreshButtonSelect}
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '13px', color: '#92400E', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Refresh Menu
            </button>
          </div>
        )}

        {/* Category tab bar */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            padding: '12px 20px',
            overflowX: 'auto',
            flexShrink: 0,
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface-card)',
          }}
        >
          {availableCategoryList.map((categoryValue) => (
            <button
              key={categoryValue}
              onClick={() => setSelectedCategoryTabValue(categoryValue)}
              style={{
                height: '36px',
                padding: '0 16px',
                borderRadius: 'var(--radius-pill)',
                border: selectedCategoryTabValue === categoryValue
                  ? 'none'
                  : '1px solid var(--border)',
                background:
                  selectedCategoryTabValue === categoryValue
                    ? 'var(--tenant-accent)'
                    : 'transparent',
                color:
                  selectedCategoryTabValue === categoryValue
                    ? '#FFFFFF'
                    : 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                fontSize: '13px',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background 120ms, color 120ms, border-color 120ms',
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
            background: 'var(--surface-secondary)',
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
              {filteredMenuItemList.map((menuItemRecord) => {
                const isExpanded = expandedItemId === menuItemRecord.restaurantMenuItemIdentifier;
                const hasDescription = !!menuItemRecord.restaurantMenuItemDescription;

                return (
                  // Wrapper div handles the hover-expand z-index lift
                  <div
                    key={menuItemRecord.restaurantMenuItemIdentifier}
                    style={{
                      position: 'relative',
                      zIndex: isExpanded ? 20 : 1,
                    }}
                    onMouseEnter={() => {
                      if (menuItemRecord.restaurantMenuItemIsAvailable && hasDescription) {
                        handleMenuItemHoverStart(menuItemRecord.restaurantMenuItemIdentifier);
                      }
                    }}
                    onMouseLeave={handleMenuItemHoverEnd}
                  >
                    <button
                      onClick={() => handleMenuItemCardSelect(menuItemRecord)}
                      disabled={!menuItemRecord.restaurantMenuItemIsAvailable}
                      style={{
                        width: '100%',
                        background: 'var(--surface-card)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: isExpanded
                          ? 'var(--shadow-card-hover)'
                          : 'var(--shadow-card)',
                        border: 'none',
                        padding: 0,
                        textAlign: 'left',
                        cursor: menuItemRecord.restaurantMenuItemIsAvailable ? 'pointer' : 'not-allowed',
                        opacity: menuItemRecord.restaurantMenuItemIsAvailable ? 1 : 0.45,
                        overflow: 'hidden',
                        transition: 'box-shadow 200ms, transform 80ms',
                        transform: isExpanded ? 'translateY(-2px)' : 'none',
                        display: 'block',
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
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-sm)',
                            zIndex: 1,
                            letterSpacing: '0.5px',
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
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" style={{ opacity: 0.6 }}>
                            <path d="M12 2v8M8 2v5M16 2v5M8 7c0 2.2 1.8 4 4 4s4-1.8 4-4M12 11v11" />
                          </svg>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ padding: '10px 12px' }}>
                        <p style={{
                          fontFamily: 'var(--font-body)',
                          fontWeight: 500,
                          fontSize: '13px',
                          color: 'var(--text-primary)',
                          marginBottom: '4px',
                          lineHeight: 1.3,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {menuItemRecord.restaurantMenuItemName}
                        </p>
                        <p className="tabular-nums" style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          fontSize: '15px',
                          color: 'var(--tenant-accent)',
                        }}>
                          ₨{menuItemRecord.restaurantMenuItemPrice.toFixed(2)}
                        </p>
                      </div>
                    </button>

                    {/* Hover-expand description overlay — appears below card after 0.9s hover */}
                    {isExpanded && hasDescription && (
                      <div
                        className="animate-expand-down"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: 'var(--surface-card)',
                          borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                          boxShadow: '0 8px 20px rgba(17, 28, 26, 0.12)',
                          padding: '10px 12px 12px',
                          borderTop: '1px solid var(--border)',
                          pointerEvents: 'none',
                        }}
                      >
                        <p style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.5,
                          fontStyle: 'italic',
                        }}>
                          {menuItemRecord.restaurantMenuItemDescription}
                        </p>
                        <p style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '11px',
                          fontWeight: 500,
                          color: 'var(--text-secondary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginTop: '6px',
                          opacity: 0.7,
                        }}>
                          {menuItemRecord.restaurantMenuItemCategory}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
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
        <div style={{
          padding: '16px 20px 12px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '13px',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '2px',
          }}>
            Current Order
          </p>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '20px',
            color: 'var(--text-primary)',
          }}>
            {cartLineItemList.reduce((sum, item) => sum + item.cashierCartMenuItemQuantity, 0)} items
          </p>
        </div>

        {/* Kitchen Status Panel — 3 status columns */}
        {totalActiveOrders > 0 && (
          <div
            style={{
              borderBottom: '1px solid var(--border)',
              padding: '12px 20px',
              flexShrink: 0,
              background: 'var(--surface-secondary)',
            }}
          >
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: '10px',
            }}>
              Kitchen Status
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {/* Received */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '22px',
                  color: 'var(--status-received)',
                  lineHeight: 1,
                  marginBottom: '4px',
                }}>
                  {kitchenStatusCounts.Received}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: 'var(--status-received)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  opacity: 0.85,
                }}>
                  Ordered
                </div>
              </div>

              {/* Preparing */}
              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '22px',
                  color: 'var(--status-preparing)',
                  lineHeight: 1,
                  marginBottom: '4px',
                }}>
                  {kitchenStatusCounts.Preparing}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: 'var(--status-preparing)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  opacity: 0.85,
                }}>
                  Preparing
                </div>
              </div>

              {/* Ready */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '22px',
                  color: 'var(--status-ready)',
                  lineHeight: 1,
                  marginBottom: '4px',
                }}>
                  {kitchenStatusCounts.Ready}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: 'var(--status-ready)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  opacity: 0.85,
                }}>
                  Ready
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ready Orders Queue — real-time Collect & Pay */}
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
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--status-ready)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span className="pulse-live" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-ready)', display: 'inline-block' }} />
              Ready for Pickup
            </p>
            {readyOrderList.map((readyOrderEntry) => (
              <div
                key={readyOrderEntry.orderId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(16, 185, 129, 0.06)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)' }}>
                    #{readyOrderEntry.orderNumber}
                  </span>
                  <span style={{
                    background: 'var(--status-ready)',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    letterSpacing: '0.5px',
                  }}>
                    READY
                  </span>
                </div>
                <button
                  onClick={() => handleCollectAndPayButtonSelect(readyOrderEntry.orderId)}
                  style={{
                    height: '38px', padding: '0 14px',
                    background: 'var(--status-ready)', color: '#FFFFFF',
                    borderRadius: 'var(--radius-md)', border: 'none',
                    fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                    transition: 'opacity 120ms',
                  }}
                >
                  Collect &amp; Pay
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Cart line items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {cartLineItemList.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '12px',
              color: 'var(--text-secondary)',
            }}>
              <div style={{
                width: '52px', height: '52px',
                borderRadius: '50%',
                background: 'var(--surface-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.5 }}>
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Order is empty
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Tap menu items to add them.
                </p>
              </div>
            </div>
          ) : (
            cartLineItemList.map((cartLineItem) => (
              <div
                key={cartLineItem.cashierCartMenuItemIdentifier}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 0',
                  borderBottom: '1px solid var(--border)',
                  minHeight: '48px',
                }}
              >
                {/* Item name */}
                <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {cartLineItem.cashierCartMenuItemName}
                </span>

                {/* Quantity stepper */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => handleCartItemQuantityDecrement(cartLineItem.cashierCartMenuItemIdentifier)}
                    style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      border: '1px solid var(--border)',
                      background: 'transparent', color: 'var(--text-secondary)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px', fontWeight: 300, lineHeight: 1,
                    }}
                  >
                    −
                  </button>
                  <span className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '15px', width: '22px', textAlign: 'center' }}>
                    {cartLineItem.cashierCartMenuItemQuantity}
                  </span>
                  <button
                    onClick={() => handleCartItemQuantityIncrement(cartLineItem.cashierCartMenuItemIdentifier)}
                    style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      border: '1px solid var(--border)',
                      background: 'transparent', color: 'var(--text-secondary)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px', fontWeight: 300, lineHeight: 1,
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Line total */}
                <span className="tabular-nums" style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  minWidth: '64px',
                  textAlign: 'right',
                }}>
                  ₨{(cartLineItem.cashierCartMenuItemPrice * cartLineItem.cashierCartMenuItemQuantity).toFixed(2)}
                </span>

                {/* Remove */}
                <button
                  onClick={() => handleCartItemRemove(cartLineItem.cashierCartMenuItemIdentifier)}
                  style={{
                    width: '24px', height: '24px',
                    borderRadius: '50%',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart footer */}
        <div style={{ padding: '16px 20px', borderTop: '2px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Subtotal
            </span>
            <span className="tabular-nums" style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '24px',
              color: 'var(--text-primary)',
            }}>
              ₨{cartSubtotal.toFixed(2)}
            </span>
          </div>
          <button
            id="place-order-button"
            onClick={handlePlaceOrderButtonSelect}
            disabled={cartLineItemList.length === 0 || isPlaceOrderPending}
            style={{
              width: '100%', height: '52px',
              background: cartLineItemList.length === 0 ? 'var(--surface-secondary)' : 'var(--tenant-accent)',
              color: cartLineItemList.length === 0 ? 'var(--text-secondary)' : '#FFFFFF',
              borderRadius: 'var(--radius-md)', border: 'none',
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '15px',
              cursor: cartLineItemList.length === 0 || isPlaceOrderPending ? 'not-allowed' : 'pointer',
              transition: 'background 150ms, opacity 120ms',
              letterSpacing: '0.3px',
            }}
          >
            {isPlaceOrderPending ? 'Placing Order…' : `Place Order${cartLineItemList.length > 0 ? ` · ₨${cartSubtotal.toFixed(2)}` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
