'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  postCreateRestaurantEmployee,
  putUpdateRestaurantEmployee,
} from '@/lib/api/employeeApiClient';
import type { RestaurantEmployeeRecord } from '@/lib/types/employeeTypes';
import { emitToastNotification } from '../shared/ToastNotification';

interface EmployeeFormModalProperties {
  employeeRecordToEdit: RestaurantEmployeeRecord | null;
  onCloseModalRequest: () => void;
}

export default function EmployeeFormModal({
  employeeRecordToEdit,
  onCloseModalRequest,
}: EmployeeFormModalProperties): React.JSX.Element {
  const isEditMode = employeeRecordToEdit !== null;
  const reactQueryClientInstance = useQueryClient();

  const [fullNameInputValue, setFullNameInputValue] = useState(
    employeeRecordToEdit?.restaurantEmployeeFullName ?? ''
  );
  const [emailInputValue, setEmailInputValue] = useState(
    employeeRecordToEdit?.restaurantEmployeeEmail ?? ''
  );
  const [passwordInputValue, setPasswordInputValue] = useState('');
  const [roleSelectValue, setRoleSelectValue] = useState<'chef' | 'cashier'>(
    (employeeRecordToEdit?.restaurantEmployeeRole as 'chef' | 'cashier') ?? 'cashier'
  );
  const [formErrorMessage, setFormErrorMessage] = useState('');

  const createEmployeeMutation = useMutation({
    mutationFn: postCreateRestaurantEmployee,
    onSuccess: () => {
      reactQueryClientInstance.invalidateQueries({ queryKey: ['employees'] });
      emitToastNotification('Employee created successfully.', 'success');
      onCloseModalRequest();
    },
    onError: (mutationError: unknown) => {
      const errorResponse = mutationError as { response?: { data?: { message?: string } } };
      setFormErrorMessage(errorResponse?.response?.data?.message ?? 'Failed to create employee.');
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: ({
      restaurantEmployeeIdentifier,
      updatePayload,
    }: {
      restaurantEmployeeIdentifier: string;
      updatePayload: { fullName?: string; role?: 'chef' | 'cashier' };
    }) => putUpdateRestaurantEmployee(restaurantEmployeeIdentifier, updatePayload),
    onSuccess: () => {
      reactQueryClientInstance.invalidateQueries({ queryKey: ['employees'] });
      emitToastNotification('Employee updated.', 'success');
      onCloseModalRequest();
    },
    onError: () => {
      setFormErrorMessage('Failed to update employee.');
    },
  });

  const isFormSubmissionPending =
    createEmployeeMutation.isPending || updateEmployeeMutation.isPending;

  function handleEmployeeFormSubmit(
    formSubmitEvent: React.FormEvent<HTMLFormElement>
  ): void {
    formSubmitEvent.preventDefault();
    setFormErrorMessage('');

    if (isEditMode && employeeRecordToEdit) {
      updateEmployeeMutation.mutate({
        restaurantEmployeeIdentifier: employeeRecordToEdit.restaurantEmployeeIdentifier,
        updatePayload: { fullName: fullNameInputValue, role: roleSelectValue },
      });
    } else {
      if (passwordInputValue.length < 6) {
        setFormErrorMessage('Password must be at least 6 characters.');
        return;
      }
      createEmployeeMutation.mutate({
        fullName: fullNameInputValue,
        email: emailInputValue,
        password: passwordInputValue,
        role: roleSelectValue,
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

  const sharedLabelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    display: 'block',
    marginBottom: '6px',
  };

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
      onClick={onCloseModalRequest}
    >
      <div
        className="animate-modal-entrance"
        style={{
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-float)',
          padding: '32px',
          width: '440px',
          maxWidth: '95vw',
        }}
        onClick={(mouseEvent) => mouseEvent.stopPropagation()}
      >
        <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '20px', color: 'var(--text-primary)', marginBottom: '24px' }}>
          {isEditMode ? 'Edit Employee' : 'Add Employee'}
        </h2>

        <form onSubmit={handleEmployeeFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="employee-form-full-name" style={sharedLabelStyle}>Full Name</label>
            <input
              id="employee-form-full-name"
              type="text"
              required
              value={fullNameInputValue}
              onChange={(ev) => setFullNameInputValue(ev.target.value)}
              placeholder="Full Name"
              style={sharedInputStyle}
            />
          </div>

          {!isEditMode && (
            <div>
              <label htmlFor="employee-form-email" style={sharedLabelStyle}>Email</label>
              <input
                id="employee-form-email"
                type="email"
                required
                value={emailInputValue}
                onChange={(ev) => setEmailInputValue(ev.target.value)}
                placeholder="employee@restaurant.com"
                style={sharedInputStyle}
              />
            </div>
          )}

          {!isEditMode && (
            <div>
              <label htmlFor="employee-form-password" style={sharedLabelStyle}>Password (min 6)</label>
              <input
                id="employee-form-password"
                type="password"
                required
                value={passwordInputValue}
                onChange={(ev) => setPasswordInputValue(ev.target.value)}
                placeholder="••••••••"
                style={sharedInputStyle}
              />
            </div>
          )}

          <div>
            <label htmlFor="employee-form-role" style={sharedLabelStyle}>Role</label>
            <select
              id="employee-form-role"
              value={roleSelectValue}
              onChange={(ev) => setRoleSelectValue(ev.target.value as 'chef' | 'cashier')}
              style={{ ...sharedInputStyle }}
            >
              <option value="cashier">Cashier</option>
              <option value="chef">Chef</option>
            </select>
          </div>

          {formErrorMessage && (
            <p style={{ fontSize: '14px', color: '#EF4444', background: 'rgba(239, 68, 68, 0.08)', padding: '10px 14px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid #EF4444' }}>
              {formErrorMessage}
            </p>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onCloseModalRequest}
              disabled={isFormSubmissionPending}
              style={{
                padding: '0 20px', height: '44px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-secondary)', fontFamily: 'var(--font-body)',
                fontWeight: 500, fontSize: '14px', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              id="employee-form-submit-button"
              type="submit"
              disabled={isFormSubmissionPending}
              style={{
                padding: '0 20px', height: '44px', borderRadius: 'var(--radius-md)',
                border: 'none', background: 'var(--tenant-accent)', color: '#FFFFFF',
                fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '14px',
                cursor: isFormSubmissionPending ? 'not-allowed' : 'pointer',
                opacity: isFormSubmissionPending ? 0.7 : 1,
              }}
            >
              {isFormSubmissionPending ? 'Saving…' : isEditMode ? 'Save Changes' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
