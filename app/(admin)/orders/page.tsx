'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRestaurantOrderHistory } from '@/lib/api/orderApiClient';
import type { RestaurantOrderRecord, OrderStatusValue } from '@/lib/types/orderTypes';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import EmptyStateDisplay from '@/components/shared/EmptyStateDisplay';

const orderStatusColorMap: Record<OrderStatusValue, string> = {
  Received:  'var(--status-received)',
  Preparing: 'var(--status-preparing)',
  Ready:     'var(--status-ready)',
  Paid:      'var(--status-closed)',
};

export default function AdminOrderHistoryPage(): React.JSX.Element {
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [dateFromFilterValue, setDateFromFilterValue] = useState('');
  const [dateToFilterValue, setDateToFilterValue] = useState('');
  const [expandedOrderIdentifier, setExpandedOrderIdentifier] = useState<string | null>(null);

  const { data: orderHistoryData, isLoading: isOrderHistoryLoading } = useQuery({
    queryKey: ['orders', 'history', { page: currentPageNumber, from: dateFromFilterValue, to: dateToFilterValue }],
    queryFn: () =>
      getRestaurantOrderHistory({
        page: currentPageNumber,
        limit: 20,
        from: dateFromFilterValue || undefined,
        to: dateToFilterValue || undefined,
      }),
  });

  const totalPageCount = orderHistoryData
    ? Math.ceil(orderHistoryData.total / orderHistoryData.limit)
    : 1;

  function handleDateFilterApply(): void {
    setCurrentPageNumber(1);
  }

  function handleOrderRowToggle(restaurantOrderIdentifier: string): void {
    setExpandedOrderIdentifier((previousIdentifier) =>
      previousIdentifier === restaurantOrderIdentifier ? null : restaurantOrderIdentifier
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '26px', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Order History
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Browse and filter completed orders.
        </p>
      </div>

      {/* Filter bar */}
      <div
        style={{
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-card)',
          padding: '16px 20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="order-history-from-date" style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            From
          </label>
          <input
            id="order-history-from-date"
            type="date"
            value={dateFromFilterValue}
            onChange={(ev) => setDateFromFilterValue(ev.target.value)}
            style={{ height: '40px', padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-secondary)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="order-history-to-date" style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            To
          </label>
          <input
            id="order-history-to-date"
            type="date"
            value={dateToFilterValue}
            onChange={(ev) => setDateToFilterValue(ev.target.value)}
            style={{ height: '40px', padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-secondary)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none' }}
          />
        </div>
        <button
          onClick={handleDateFilterApply}
          style={{ height: '40px', padding: '0 16px', background: 'var(--tenant-accent)', color: '#FFFFFF', borderRadius: 'var(--radius-md)', border: 'none', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}
        >
          Apply Filter
        </button>
        {(dateFromFilterValue || dateToFilterValue) && (
          <button
            onClick={() => { setDateFromFilterValue(''); setDateToFilterValue(''); setCurrentPageNumber(1); }}
            style={{ height: '40px', padding: '0 16px', background: 'transparent', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: '14px', cursor: 'pointer' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div
        style={{
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr 120px 80px 140px',
            padding: '12px 20px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {['Order #', 'Items', 'Total', 'Status', 'Created At'].map((columnHeader) => (
            <span key={columnHeader} style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              {columnHeader}
            </span>
          ))}
        </div>

        {isOrderHistoryLoading ? (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3, 4].map((skeletonRow) => (
              <LoadingSkeleton key={skeletonRow} skeletonHeight="52px" />
            ))}
          </div>
        ) : (orderHistoryData?.orders ?? []).length === 0 ? (
          <EmptyStateDisplay
            emptyStateIconElement={
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            }
            emptyStateMessage="No orders found for the selected period."
          />
        ) : (
          (orderHistoryData?.orders ?? []).map((orderRecord: RestaurantOrderRecord, orderIndex: number) => (
            <React.Fragment key={orderRecord.restaurantOrderIdentifier}>
              {/* Row */}
              <div
                onClick={() => handleOrderRowToggle(orderRecord.restaurantOrderIdentifier)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 120px 80px 140px',
                  padding: '14px 20px',
                  alignItems: 'center',
                  background: orderIndex % 2 === 0 ? 'var(--surface-card)' : 'var(--surface-secondary)',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <span className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                  #{orderRecord.restaurantOrderNumber}
                </span>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {orderRecord.restaurantOrderLineItems.length} item{orderRecord.restaurantOrderLineItems.length !== 1 ? 's' : ''}
                </span>
                <span className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                  ₨{orderRecord.restaurantOrderTotalAmount.toFixed(2)}
                </span>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '12px',
                    fontWeight: 500,
                    background: `${orderStatusColorMap[orderRecord.restaurantOrderStatus]}20`,
                    color: orderStatusColorMap[orderRecord.restaurantOrderStatus],
                  }}
                >
                  {orderRecord.restaurantOrderStatus}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {new Date(orderRecord.restaurantOrderCreatedAt).toLocaleString()}
                </span>
              </div>

              {/* Accordion */}
              {expandedOrderIdentifier === orderRecord.restaurantOrderIdentifier && (
                <div
                  style={{
                    padding: '16px 20px 20px',
                    background: 'var(--surface-secondary)',
                    borderBottom: '1px solid var(--border)',
                    animation: 'none',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                        Items
                      </p>
                      {orderRecord.restaurantOrderLineItems.map((lineItem, lineItemIndex) => (
                        <p key={lineItemIndex} style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                          {lineItem.orderLineItemQuantity}× {lineItem.orderLineItemName}
                          <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>
                            ₨{(lineItem.orderLineItemPrice * lineItem.orderLineItemQuantity).toFixed(2)}
                          </span>
                        </p>
                      ))}
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                        Details
                      </p>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Order ID: <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '12px' }}>{orderRecord.restaurantOrderIdentifier}</span>
                      </p>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Updated: {new Date(orderRecord.restaurantOrderUpdatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPageCount > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          {Array.from({ length: totalPageCount }, (_, pageIndex) => pageIndex + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setCurrentPageNumber(pageNumber)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background:
                    pageNumber === currentPageNumber ? 'var(--tenant-accent)' : 'var(--surface-card)',
                  color:
                    pageNumber === currentPageNumber ? '#FFFFFF' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                {pageNumber}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
