'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRestaurantMenuItemList,
  patchToggleRestaurantMenuItemAvailability,
  deleteRestaurantMenuItem,
} from '@/lib/api/menuItemApiClient';
import type { RestaurantMenuItemRecord } from '@/lib/types/menuItemTypes';
import MenuItemFormModal from '@/components/admin/MenuItemFormModal';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { emitToastNotification } from '@/components/shared/ToastNotification';

function ForkPlaceholderIcon(): React.JSX.Element {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2v8M8 2v5M16 2v5M8 7c0 2.2 1.8 4 4 4s4-1.8 4-4" />
      <path d="M12 11v11" />
    </svg>
  );
}

export default function AdminMenuPage(): React.JSX.Element {
  const reactQueryClientInstance = useQueryClient();

  const { data: menuItemListData, isLoading: isMenuItemListLoading } = useQuery({
    queryKey: ['menu-items'],
    queryFn: getRestaurantMenuItemList,
  });

  const [isAddMenuItemModalOpen, setIsAddMenuItemModalOpen] = useState(false);
  const [menuItemRecordToEdit, setMenuItemRecordToEdit] =
    useState<RestaurantMenuItemRecord | null>(null);
  const [menuItemRecordToDelete, setMenuItemRecordToDelete] =
    useState<RestaurantMenuItemRecord | null>(null);

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({
      restaurantMenuItemIdentifier,
      newAvailabilityValue,
    }: {
      restaurantMenuItemIdentifier: string;
      newAvailabilityValue: boolean;
    }) =>
      patchToggleRestaurantMenuItemAvailability(restaurantMenuItemIdentifier, {
        isAvailable: newAvailabilityValue,
      }),
    onSuccess: () => {
      reactQueryClientInstance.invalidateQueries({ queryKey: ['menu-items'] });
    },
    onError: () => {
      emitToastNotification('Failed to toggle item availability.', 'error');
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: deleteRestaurantMenuItem,
    onSuccess: () => {
      reactQueryClientInstance.invalidateQueries({ queryKey: ['menu-items'] });
      setMenuItemRecordToDelete(null);
      emitToastNotification('Menu item deleted.', 'success');
    },
    onError: () => {
      emitToastNotification('Failed to delete menu item.', 'error');
    },
  });

  const menuItemList = menuItemListData?.menuItems ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '26px', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Menu
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {menuItemList.length} items in your catalogue.
          </p>
        </div>
        <button
          id="add-menu-item-button"
          onClick={() => setIsAddMenuItemModalOpen(true)}
          style={{
            height: 'var(--min-touch-target)', padding: '0 20px',
            background: 'var(--tenant-accent)', color: '#FFFFFF',
            borderRadius: 'var(--radius-md)', border: 'none',
            fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '14px', cursor: 'pointer',
          }}
        >
          + Add Item
        </button>
      </div>

      {/* Grid */}
      {isMenuItemListLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[1, 2, 3, 4, 5, 6].map((skeletonCard) => (
            <LoadingSkeleton key={skeletonCard} skeletonHeight="220px" />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Add Item card */}
          <button
            onClick={() => setIsAddMenuItemModalOpen(true)}
            style={{
              background: 'var(--surface-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '2px dashed var(--border)',
              minHeight: '220px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'border-color 150ms',
              fontFamily: 'var(--font-body)',
            }}
          >
            <span style={{ fontSize: '24px', fontWeight: 300 }}>+</span>
            <span style={{ fontSize: '14px' }}>Add Menu Item</span>
          </button>

          {/* Menu item cards */}
          {menuItemList.map((menuItemRecord) => (
            <div
              key={menuItemRecord.restaurantMenuItemIdentifier}
              style={{
                background: 'var(--surface-card)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-card)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                opacity: menuItemRecord.restaurantMenuItemIsAvailable ? 1 : 0.6,
              }}
            >
              {/* Image area */}
              <div
                style={{
                  aspectRatio: '16/10',
                  background: 'var(--surface-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  position: 'relative',
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
                  <ForkPlaceholderIcon />
                )}
              </div>

              {/* Card body */}
              <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                  {menuItemRecord.restaurantMenuItemName}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {menuItemRecord.restaurantMenuItemCategory}
                </p>
                <p className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '18px', color: 'var(--text-primary)', marginTop: '4px' }}>
                  ₨{menuItemRecord.restaurantMenuItemPrice.toFixed(2)}
                </p>

                {/* Bottom row: availability + actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                  <button
                    onClick={() =>
                      toggleAvailabilityMutation.mutate({
                        restaurantMenuItemIdentifier: menuItemRecord.restaurantMenuItemIdentifier,
                        newAvailabilityValue: !menuItemRecord.restaurantMenuItemIsAvailable,
                      })
                    }
                    style={{
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-pill)',
                      border: menuItemRecord.restaurantMenuItemIsAvailable
                        ? 'none'
                        : '1px solid var(--border)',
                      background: menuItemRecord.restaurantMenuItemIsAvailable
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'transparent',
                      color: menuItemRecord.restaurantMenuItemIsAvailable
                        ? '#059669'
                        : 'var(--text-secondary)',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 500,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {menuItemRecord.restaurantMenuItemIsAvailable ? 'Available' : 'Unavailable'}
                  </button>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      title="Edit item"
                      onClick={() => setMenuItemRecordToEdit(menuItemRecord)}
                      style={{ padding: '6px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      title="Delete item"
                      onClick={() => setMenuItemRecordToDelete(menuItemRecord)}
                      style={{ padding: '6px', background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {(isAddMenuItemModalOpen || menuItemRecordToEdit !== null) && (
        <MenuItemFormModal
          menuItemRecordToEdit={menuItemRecordToEdit}
          onCloseModalRequest={() => {
            setIsAddMenuItemModalOpen(false);
            setMenuItemRecordToEdit(null);
          }}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmationModal
        isConfirmationModalVisible={menuItemRecordToDelete !== null}
        confirmationModalTitle="Delete Menu Item"
        confirmationModalBodyText={`Permanently delete "${menuItemRecordToDelete?.restaurantMenuItemName ?? ''}"? This cannot be undone.`}
        confirmButtonLabel="Delete Item"
        isConfirmationActionPending={deleteMenuItemMutation.isPending}
        onConfirmActionSelect={() => {
          if (menuItemRecordToDelete) {
            deleteMenuItemMutation.mutate(menuItemRecordToDelete.restaurantMenuItemIdentifier);
          }
        }}
        onCancelActionSelect={() => setMenuItemRecordToDelete(null)}
      />
    </div>
  );
}
