'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { postAuthLoginCredentials } from '@/lib/api/authApiClient';
import { useAuthenticationStore } from '@/lib/auth/authenticationStore';
import { emitToastNotification } from '@/components/shared/ToastNotification';
import type { EmployeeRoleValue } from '@/lib/types/employeeTypes';
import type { Metadata } from 'next';

const employeeRolePortalPathMap: Record<EmployeeRoleValue, string> = {
  admin:   '/dashboard',
  cashier: '/pos',
  chef:    '/kds',
};

export default function LoginPage(): React.JSX.Element {
  const routerInstance = useRouter();
  const setAuthenticationSession = useAuthenticationStore(
    (authState) => authState.setAuthenticationSession
  );

  const [loginEmailInputValue, setLoginEmailInputValue] = useState('');
  const [loginPasswordInputValue, setLoginPasswordInputValue] = useState('');
  const [isLoginRequestPending, setIsLoginRequestPending] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState('');

  async function handleLoginFormSubmit(
    formSubmitEvent: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    formSubmitEvent.preventDefault();
    setLoginErrorMessage('');
    setIsLoginRequestPending(true);

    try {
      const loginApiResponse = await postAuthLoginCredentials({
        email: loginEmailInputValue,
        password: loginPasswordInputValue,
      });

      setAuthenticationSession({
        accessToken: loginApiResponse.accessToken,
        refreshToken: loginApiResponse.refreshToken,
        authenticatedEmployee: loginApiResponse.employee,
        restaurantTenant: null,
      });

      // Set cookie so middleware can read role
      document.cookie = `accessToken=${loginApiResponse.accessToken}; path=/; max-age=${15 * 60}`;

      const targetPortalPath =
        employeeRolePortalPathMap[loginApiResponse.employee.role] ?? '/login';

      emitToastNotification(`Welcome, ${loginApiResponse.employee.fullName}!`, 'success');
      routerInstance.replace(targetPortalPath);
    } catch {
      setLoginErrorMessage('Invalid email or password. Please try again.');
    } finally {
      setIsLoginRequestPending(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0C1110 0%, #111C1A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div
          style={{ textAlign: 'center', marginBottom: '36px' }}
        >
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'var(--tenant-accent)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#FFFFFF',
                }}
              >
                E
              </div>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: '20px',
                  color: 'var(--kds-text-primary)',
                }}
              >
                ExpediteHub
              </span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'var(--kds-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--kds-border)',
            padding: '36px',
          }}
        >
          <h1
            style={{
              fontWeight: 600,
              fontSize: '22px',
              color: 'var(--kds-text-primary)',
              marginBottom: '6px',
            }}
          >
            Sign in
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--kds-text-secondary)',
              marginBottom: '28px',
            }}
          >
            Enter your credentials to access your portal.
          </p>

          <form onSubmit={handleLoginFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                htmlFor="login-email-input"
                style={{ fontSize: '13px', fontWeight: 500, color: 'var(--kds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}
              >
                Email
              </label>
              <input
                id="login-email-input"
                type="email"
                required
                value={loginEmailInputValue}
                onChange={(inputChangeEvent) =>
                  setLoginEmailInputValue(inputChangeEvent.target.value)
                }
                placeholder="you@restaurant.com"
                style={{
                  height: '48px',
                  padding: '0 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--kds-border)',
                  background: 'var(--kds-bg)',
                  color: 'var(--kds-text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                htmlFor="login-password-input"
                style={{ fontSize: '13px', fontWeight: 500, color: 'var(--kds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}
              >
                Password
              </label>
              <input
                id="login-password-input"
                type="password"
                required
                value={loginPasswordInputValue}
                onChange={(inputChangeEvent) =>
                  setLoginPasswordInputValue(inputChangeEvent.target.value)
                }
                placeholder="••••••••"
                style={{
                  height: '48px',
                  padding: '0 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--kds-border)',
                  background: 'var(--kds-bg)',
                  color: 'var(--kds-text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  outline: 'none',
                }}
              />
            </div>

            {loginErrorMessage && (
              <p
                style={{
                  fontSize: '14px',
                  color: '#EF4444',
                  background: 'rgba(239, 68, 68, 0.1)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '3px solid #EF4444',
                }}
              >
                {loginErrorMessage}
              </p>
            )}

            <button
              id="login-submit-button"
              type="submit"
              disabled={isLoginRequestPending}
              style={{
                height: '48px',
                background: 'var(--tenant-accent)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '15px',
                cursor: isLoginRequestPending ? 'not-allowed' : 'pointer',
                opacity: isLoginRequestPending ? 0.7 : 1,
                marginTop: '4px',
              }}
            >
              {isLoginRequestPending ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p
            style={{
              textAlign: 'center',
              marginTop: '24px',
              fontSize: '14px',
              color: 'var(--kds-text-secondary)',
            }}
          >
            New restaurant?{' '}
            <Link
              href="/register"
              style={{ color: 'var(--tenant-accent)', textDecoration: 'none', fontWeight: 500 }}
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
