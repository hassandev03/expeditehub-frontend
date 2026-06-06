'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { postAuthLoginCredentials } from '@/lib/api/authApiClient';
import { useAuthenticationStore } from '@/lib/auth/authenticationStore';
import { emitToastNotification } from '@/components/shared/ToastNotification';
import type { EmployeeRoleValue } from '@/lib/types/employeeTypes';

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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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

  const inputStyle: React.CSSProperties = {
    height: '48px',
    padding: '0 14px',
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid var(--border)',
    background: 'var(--surface-secondary)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
    fontSize: '15px',
    outline: 'none',
    width: '100%',
    transition: 'border-color 150ms',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.7px',
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0D1312 0%, #111C1A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Subtle grid overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `linear-gradient(color-mix(in srgb, var(--tenant-accent) 4%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--tenant-accent) 4%, transparent) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="ExpediteHub Logo"
                width={36}
                height={36}
                style={{ borderRadius: 'var(--radius-sm)', objectFit: 'contain' }}
              />
              <span style={{ fontWeight: 700, fontSize: '20px', color: '#FFFFFF', letterSpacing: '-0.3px' }}>
                ExpediteHub
              </span>
            </div>
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '6px' }}>
            Restaurant Operations Platform
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
          }}
        >
          {/* Accent strip at top */}
          <div style={{ height: '4px', background: 'var(--tenant-accent)' }} />

          <div style={{ padding: '32px 36px 36px' }}>
            <h1 style={{ fontWeight: 700, fontSize: '22px', color: '#111827', marginBottom: '4px', letterSpacing: '-0.3px' }}>
              Sign in
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '28px' }}>
              Enter your credentials to access your portal.
            </p>

            <form onSubmit={handleLoginFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="login-email-input" style={labelStyle}>Email</label>
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={loginEmailInputValue}
                  onChange={(ev) => setLoginEmailInputValue(ev.target.value)}
                  placeholder="you@restaurant.com"
                  style={inputStyle}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--tenant-accent)'; (e.target as HTMLInputElement).style.background = '#FFFFFF'; }}
                  onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border)'; (e.target as HTMLInputElement).style.background = 'var(--surface-secondary)'; }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="login-password-input" style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password-input"
                    type={isPasswordVisible ? 'text' : 'password'}
                    required
                    value={loginPasswordInputValue}
                    onChange={(ev) => setLoginPasswordInputValue(ev.target.value)}
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: '46px' }}
                    onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--tenant-accent)'; (e.target as HTMLInputElement).style.background = '#FFFFFF'; }}
                    onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border)'; (e.target as HTMLInputElement).style.background = 'var(--surface-secondary)'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible((v) => !v)}
                    aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: '#9CA3AF', padding: '4px', display: 'flex', alignItems: 'center',
                    }}
                  >
                    {isPasswordVisible ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {loginErrorMessage && (
                <div style={{
                  fontSize: '13px', color: '#DC2626',
                  background: '#FEF2F2',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '3px solid #DC2626',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="currentColor"/>
                  </svg>
                  {loginErrorMessage}
                </div>
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
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: isLoginRequestPending ? 'not-allowed' : 'pointer',
                  opacity: isLoginRequestPending ? 0.7 : 1,
                  marginTop: '4px',
                  transition: 'opacity 150ms, transform 80ms',
                  letterSpacing: '0.2px',
                }}
              >
                {isLoginRequestPending ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6B7280' }}>
              New restaurant?{' '}
              <Link href="/register" style={{ color: 'var(--tenant-accent)', textDecoration: 'none', fontWeight: 600 }}>
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
