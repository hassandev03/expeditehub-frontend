'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRestaurantEmployeeList,
  patchDeactivateRestaurantEmployee,
} from '@/lib/api/employeeApiClient';
import type { RestaurantEmployeeRecord, EmployeeRoleValue } from '@/lib/types/employeeTypes';
import EmployeeFormModal from '@/components/admin/EmployeeFormModal';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import EmptyStateDisplay from '@/components/shared/EmptyStateDisplay';
import { emitToastNotification } from '@/components/shared/ToastNotification';

function generateAvatarBackgroundColor(employeeFullName: string): string {
  if (!employeeFullName) return '#6366F1';
  const colorOptions = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];
  const nameCharCodeSum = employeeFullName
    .split('')
    .reduce((charCodeSum, currentChar) => charCodeSum + currentChar.charCodeAt(0), 0);
  return colorOptions[nameCharCodeSum % colorOptions.length];
}

const employeeRoleBadgeStyleMap: Record<
  EmployeeRoleValue,
  { background: string; color: string }
> = {
  admin:   { background: 'rgba(17, 28, 26, 0.1)', color: 'var(--text-primary)' },
  chef:    { background: 'rgba(245, 158, 11, 0.15)', color: '#B45309' },
  cashier: { background: 'rgba(59, 130, 246, 0.15)', color: '#1D4ED8' },
};

export default function AdminStaffPage(): React.JSX.Element {
  const reactQueryClientInstance = useQueryClient();

  const { data: employeeListData, isLoading: isEmployeeListLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: getRestaurantEmployeeList,
  });

  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [employeeRecordToEdit, setEmployeeRecordToEdit] =
    useState<RestaurantEmployeeRecord | null>(null);
  const [employeeRecordToDeactivate, setEmployeeRecordToDeactivate] =
    useState<RestaurantEmployeeRecord | null>(null);

  const deactivateEmployeeMutation = useMutation({
    mutationFn: (restaurantEmployeeIdentifier: string) =>
      patchDeactivateRestaurantEmployee(restaurantEmployeeIdentifier),
    onSuccess: () => {
      reactQueryClientInstance.invalidateQueries({ queryKey: ['employees'] });
      setEmployeeRecordToDeactivate(null);
      emitToastNotification('Employee deactivated.', 'success');
    },
    onError: () => {
      emitToastNotification('Failed to deactivate employee.', 'error');
    },
  });

  const activeEmployeeList = employeeListData?.employees ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '26px', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Staff
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Manage your restaurant employees.
          </p>
        </div>
        <button
          id="add-employee-button"
          onClick={() => setIsAddEmployeeModalOpen(true)}
          style={{
            height: 'var(--min-touch-target)',
            padding: '0 20px',
            background: 'var(--tenant-accent)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          + Add Employee
        </button>
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
        {/* Table header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 2fr 1fr 100px',
            padding: '12px 20px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {['Employee', 'Role', 'Email', 'Status', 'Actions'].map((columnHeader) => (
            <span
              key={columnHeader}
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                fontSize: '12px',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}
            >
              {columnHeader}
            </span>
          ))}
        </div>

        {/* Table body */}
        {isEmployeeListLoading ? (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map((skeletonRow) => (
              <LoadingSkeleton key={skeletonRow} skeletonHeight="52px" />
            ))}
          </div>
        ) : activeEmployeeList.length === 0 ? (
          <EmptyStateDisplay
            emptyStateIconElement={
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            }
            emptyStateMessage="No employees yet. Add your first staff member."
          />
        ) : (
          activeEmployeeList.map((employeeRecord, employeeIndex) => (
            <div
              key={employeeRecord.restaurantEmployeeIdentifier}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 2fr 1fr 100px',
                padding: '14px 20px',
                alignItems: 'center',
                background: employeeIndex % 2 === 0 ? 'var(--surface-card)' : 'var(--surface-secondary)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              {/* Avatar + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: generateAvatarBackgroundColor(employeeRecord.restaurantEmployeeFullName),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 500,
                    fontSize: '14px',
                    flexShrink: 0,
                  }}
                >
                  {employeeRecord.restaurantEmployeeFullName
                    ? employeeRecord.restaurantEmployeeFullName
                        .split(' ')
                        .map((namePart) => namePart[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : '?'}
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '15px', color: 'var(--text-primary)' }}>
                  {employeeRecord.restaurantEmployeeFullName || 'Unknown'}
                </span>
              </div>

              {/* Role badge */}
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-pill)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 500,
                    fontSize: '12px',
                    textTransform: 'capitalize',
                    ...employeeRoleBadgeStyleMap[employeeRecord.restaurantEmployeeRole],
                  }}
                >
                  {employeeRecord.restaurantEmployeeRole}
                </span>
              </div>

              {/* Email */}
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                {employeeRecord.restaurantEmployeeEmail}
              </span>

              {/* Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: employeeRecord.restaurantEmployeeIsActive
                      ? 'var(--status-ready)'
                      : 'var(--text-secondary)',
                  }}
                />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {employeeRecord.restaurantEmployeeIsActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  title="Edit employee"
                  onClick={() => setEmployeeRecordToEdit(employeeRecord)}
                  style={{
                    padding: '6px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                {employeeRecord.restaurantEmployeeIsActive &&
                  employeeRecord.restaurantEmployeeRole !== 'admin' && (
                    <button
                      title="Deactivate employee"
                      onClick={() => setEmployeeRecordToDeactivate(employeeRecord)}
                      style={{
                        padding: '6px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 12h8" />
                      </svg>
                    </button>
                  )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit modal */}
      {(isAddEmployeeModalOpen || employeeRecordToEdit !== null) && (
        <EmployeeFormModal
          employeeRecordToEdit={employeeRecordToEdit}
          onCloseModalRequest={() => {
            setIsAddEmployeeModalOpen(false);
            setEmployeeRecordToEdit(null);
          }}
        />
      )}

      {/* Deactivate confirmation */}
      <ConfirmationModal
        isConfirmationModalVisible={employeeRecordToDeactivate !== null}
        confirmationModalTitle="Deactivate Employee"
        confirmationModalBodyText={`Are you sure you want to deactivate ${employeeRecordToDeactivate?.restaurantEmployeeFullName ?? ''}? They will lose access immediately.`}
        confirmButtonLabel="Deactivate Employee"
        isConfirmationActionPending={deactivateEmployeeMutation.isPending}
        onConfirmActionSelect={() => {
          if (employeeRecordToDeactivate) {
            deactivateEmployeeMutation.mutate(
              employeeRecordToDeactivate.restaurantEmployeeIdentifier
            );
          }
        }}
        onCancelActionSelect={() => setEmployeeRecordToDeactivate(null)}
      />
    </div>
  );
}
