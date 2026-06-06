'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  postCreateRestaurantMenuItem,
  putUpdateRestaurantMenuItem,
} from '@/lib/api/menuItemApiClient';
import type { RestaurantMenuItemRecord } from '@/lib/types/menuItemTypes';
import { emitToastNotification } from '../shared/ToastNotification';

interface MenuItemFormModalProperties {
  menuItemRecordToEdit: RestaurantMenuItemRecord | null;
  onCloseModalRequest: () => void;
}

export default function MenuItemFormModal({
  menuItemRecordToEdit,
  onCloseModalRequest,
}: MenuItemFormModalProperties): React.JSX.Element {
  const isEditMode = menuItemRecordToEdit !== null;
  const reactQueryClientInstance = useQueryClient();

  const [nameInputValue, setNameInputValue] = useState(
    menuItemRecordToEdit?.restaurantMenuItemName ?? ''
  );
  const [descriptionInputValue, setDescriptionInputValue] = useState(
    menuItemRecordToEdit?.restaurantMenuItemDescription ?? ''
  );
  const [priceInputValue, setPriceInputValue] = useState(
    menuItemRecordToEdit?.restaurantMenuItemPrice?.toString() ?? ''
  );
  const [categoryInputValue, setCategoryInputValue] = useState(
    menuItemRecordToEdit?.restaurantMenuItemCategory ?? ''
  );
  const [imageUrlInputValue, setImageUrlInputValue] = useState(
    menuItemRecordToEdit?.restaurantMenuItemImageUrl ?? ''
  );
  const [formErrorMessage, setFormErrorMessage] = useState('');

  const createMenuItemMutation = useMutation({
    mutationFn: postCreateRestaurantMenuItem,
    onSuccess: () => {
      reactQueryClientInstance.invalidateQueries({ queryKey: ['menu-items'] });
      emitToastNotification('Menu item created.', 'success');
      onCloseModalRequest();
    },
    onError: (mutationError: unknown) => {
      const errorResponse = mutationError as { response?: { data?: { message?: string } } };
      setFormErrorMessage(errorResponse?.response?.data?.message ?? 'Failed to create item.');
    },
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: ({
      restaurantMenuItemIdentifier,
      updatePayload,
    }: {
      restaurantMenuItemIdentifier: string;
      updatePayload: {
        name?: string;
        description?: string;
        price?: number;
        category?: string;
        imageUrl?: string;
      };
    }) => putUpdateRestaurantMenuItem(restaurantMenuItemIdentifier, updatePayload),
    onSuccess: () => {
      reactQueryClientInstance.invalidateQueries({ queryKey: ['menu-items'] });
      emitToastNotification('Menu item updated.', 'success');
      onCloseModalRequest();
    },
    onError: () => {
      setFormErrorMessage('Failed to update item.');
    },
  });

  const isFormSubmissionPending =
    createMenuItemMutation.isPending || updateMenuItemMutation.isPending;

  function handleMenuItemFormSubmit(
    formSubmitEvent: React.FormEvent<HTMLFormElement>
  ): void {
    formSubmitEvent.preventDefault();
    setFormErrorMessage('');

    const parsedPriceValue = parseFloat(priceInputValue);
    if (isNaN(parsedPriceValue) || parsedPriceValue <= 0) {
      setFormErrorMessage('Price must be a positive number.');
      return;
    }

    if (isEditMode && menuItemRecordToEdit) {
      updateMenuItemMutation.mutate({
        restaurantMenuItemIdentifier: menuItemRecordToEdit.restaurantMenuItemIdentifier,
        updatePayload: {
          name: nameInputValue,
          description: descriptionInputValue || undefined,
          price: parsedPriceValue,
          category: categoryInputValue,
          imageUrl: imageUrlInputValue || undefined,
        },
      });
    } else {
      createMenuItemMutation.mutate({
        name: nameInputValue,
        description: descriptionInputValue || undefined,
        price: parsedPriceValue,
        category: categoryInputValue,
        imageUrl: imageUrlInputValue || undefined,
      });
    }
  }

  const sharedInputStyle: React.CSSProperties = {
    height: '48px',
    padding: '0 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    background: 'var(--surface-secondary)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
    fontSize: '15px',
    width: '100%',
    outline: 'none',
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(17, 28, 26, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={onCloseModalRequest}
    >
      <div
        className="animate-modal-entrance"
        style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', padding: '32px', width: '480px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(mouseEvent) => mouseEvent.stopPropagation()}
      >
        <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '20px', color: 'var(--text-primary)', marginBottom: '24px' }}>
          {isEditMode ? 'Edit Menu Item' : 'Add Menu Item'}
        </h2>

        <form onSubmit={handleMenuItemFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label htmlFor="menu-item-name-input" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Name *
            </label>
            <input id="menu-item-name-input" type="text" required value={nameInputValue}
              onChange={(ev) => setNameInputValue(ev.target.value)} placeholder="Cheeseburger" style={sharedInputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label htmlFor="menu-item-price-input" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Price *</label>
              <input id="menu-item-price-input" type="number" required min="0.01" step="0.01" value={priceInputValue}
                onChange={(ev) => setPriceInputValue(ev.target.value)} placeholder="250.00" style={sharedInputStyle} />
            </div>
            <div>
              <label htmlFor="menu-item-category-input" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Category *</label>
              <input id="menu-item-category-input" type="text" required value={categoryInputValue}
                onChange={(ev) => setCategoryInputValue(ev.target.value)} placeholder="Burgers" style={sharedInputStyle} />
            </div>
          </div>

          <div>
            <label htmlFor="menu-item-description-input" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Description</label>
            <textarea id="menu-item-description-input" value={descriptionInputValue}
              onChange={(ev) => setDescriptionInputValue(ev.target.value)}
              placeholder="A classic beef patty with cheddar..."
              rows={3}
              style={{ ...sharedInputStyle, height: 'auto', padding: '12px 14px', resize: 'vertical' }} />
          </div>

          <div>
            <label htmlFor="menu-item-image-url-input" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Image URL</label>
            <input id="menu-item-image-url-input" type="url" value={imageUrlInputValue}
              onChange={(ev) => setImageUrlInputValue(ev.target.value)} placeholder="https://..." style={sharedInputStyle} />
          </div>

          {formErrorMessage && (
            <p style={{ fontSize: '14px', color: '#EF4444', background: 'rgba(239, 68, 68, 0.08)', padding: '10px 14px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid #EF4444' }}>
              {formErrorMessage}
            </p>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" onClick={onCloseModalRequest} disabled={isFormSubmissionPending}
              style={{ padding: '0 20px', height: '44px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button id="menu-item-form-submit-button" type="submit" disabled={isFormSubmissionPending}
              style={{ padding: '0 20px', height: '44px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--tenant-accent)', color: '#FFFFFF', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '14px', cursor: isFormSubmissionPending ? 'not-allowed' : 'pointer', opacity: isFormSubmissionPending ? 0.7 : 1 }}>
              {isFormSubmissionPending ? 'Saving…' : isEditMode ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
