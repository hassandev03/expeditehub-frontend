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
        restaurantTenant: loginApiResponse.tenant ? {
          restaurantTenantIdentifier: loginApiResponse.tenant._id,
          restaurantTenantName: loginApiResponse.tenant.name,
          restaurantTenantAddress: loginApiResponse.tenant.address,
          restaurantTenantContactEmail: loginApiResponse.tenant.contactEmail,
          restaurantTenantLogoUrl: loginApiResponse.tenant.logoUrl,
        } : null,
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
    height: '52px',
    padding: '0 16px',
    borderRadius: 'var(--radius-lg)',
    border: '1.5px solid #E5E1D8',
    background: '#FFFFFF',
    color: '#1C1915',
    fontFamily: 'var(--font-body)',
    fontSize: '15px',
    outline: 'none',
    width: '100%',
    transition: 'all 200ms ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 600,
    color: '#4A443B',
    letterSpacing: '0.3px',
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', background: '#FCFAF5', fontFamily: 'var(--font-body)' }}>
      {/* Left Image Section */}
      <div className="hidden md:block" style={{
        flex: 1,
        position: 'relative',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/auth-bg.png" alt="Restaurant Interior" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.4), transparent)' }} />
        <div style={{ position: 'absolute', bottom: '40px', left: '40px', color: '#FFFFFF' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>
            Elevate your service.
          </h2>
          <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '400px' }}>
            The premium platform for modern restaurant operations.
          </p>
        </div>
      </div>

      {/* Right Form Section */}
      <div style={{
        width: '100%',
        maxWidth: '560px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        background: '#FCFAF5',
      }}>
        <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="ExpediteHub Logo" width={40} height={40} style={{ borderRadius: 'var(--radius-sm)', objectFit: 'contain' }} />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '24px', color: '#1C1915', letterSpacing: '-0.5px' }}>
              ExpediteHub
            </span>
          </Link>

          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '32px', color: '#1C1915', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Welcome back
            </h1>
            <p style={{ fontSize: '15px', color: '#736B5E', marginBottom: '40px' }}>
              Enter your credentials to access your portal.
            </p>

            <form onSubmit={handleLoginFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="login-email-input" style={labelStyle}>Email Address</label>
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={loginEmailInputValue}
                  onChange={(ev) => setLoginEmailInputValue(ev.target.value)}
                  placeholder="you@restaurant.com"
                  style={inputStyle}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--tenant-accent)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--tenant-accent) 15%, transparent)'; }}
                  onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#E5E1D8'; (e.target as HTMLInputElement).style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                    onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--tenant-accent)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--tenant-accent) 15%, transparent)'; }}
                    onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#E5E1D8'; (e.target as HTMLInputElement).style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible((v) => !v)}
                    aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: '#A8A296', padding: '4px', display: 'flex', alignItems: 'center',
                    }}
                  >
                    {isPasswordVisible ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {loginErrorMessage && (
                <div style={{
                  fontSize: '13px', color: '#B91C1C',
                  background: '#FEF2F2',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #F87171',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
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
                  height: '52px',
                  background: 'var(--tenant-accent)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: 'none',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: '16px',
                  cursor: isLoginRequestPending ? 'not-allowed' : 'pointer',
                  opacity: isLoginRequestPending ? 0.7 : 1,
                  marginTop: '12px',
                  transition: 'opacity 200ms, transform 100ms',
                  boxShadow: '0 4px 12px color-mix(in srgb, var(--tenant-accent) 40%, transparent)',
                }}
              >
                {isLoginRequestPending ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '15px', color: '#736B5E' }}>
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
