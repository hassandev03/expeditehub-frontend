'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { postRegisterRestaurantTenant } from '@/lib/api/employeeApiClient';
import { useAuthenticationStore } from '@/lib/auth/authenticationStore';
import { emitToastNotification } from '@/components/shared/ToastNotification';

export default function RegisterPage(): React.JSX.Element {
  const routerInstance = useRouter();
  const setAuthenticationSession = useAuthenticationStore(
    (authState) => authState.setAuthenticationSession
  );

  const [tenantNameInputValue, setTenantNameInputValue] = useState('');
  const [tenantAddressInputValue, setTenantAddressInputValue] = useState('');
  const [tenantContactEmailInputValue, setTenantContactEmailInputValue] = useState('');
  const [tenantCuisineTypeInputValue, setTenantCuisineTypeInputValue] = useState('');
  const [tenantContactPhoneInputValue, setTenantContactPhoneInputValue] = useState('');
  const [adminFullNameInputValue, setAdminFullNameInputValue] = useState('');
  const [adminEmailInputValue, setAdminEmailInputValue] = useState('');
  const [adminPasswordInputValue, setAdminPasswordInputValue] = useState('');
  const [isRegistrationRequestPending, setIsRegistrationRequestPending] = useState(false);
  const [registrationErrorMessage, setRegistrationErrorMessage] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  async function handleRegistrationFormSubmit(
    formSubmitEvent: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    formSubmitEvent.preventDefault();
    setRegistrationErrorMessage('');

    if (adminPasswordInputValue.length < 6) {
      setRegistrationErrorMessage('Admin password must be at least 6 characters.');
      return;
    }

    setIsRegistrationRequestPending(true);

    try {
      const registrationApiResponse = await postRegisterRestaurantTenant({
        name:           tenantNameInputValue,
        address:        tenantAddressInputValue,
        contactEmail:   tenantContactEmailInputValue,
        cuisineType:    tenantCuisineTypeInputValue || undefined,
        contactPhone:   tenantContactPhoneInputValue || undefined,
        adminFullName:  adminFullNameInputValue,
        adminEmail:     adminEmailInputValue,
        adminPassword:  adminPasswordInputValue,
      });

      setAuthenticationSession({
        accessToken:  registrationApiResponse.accessToken,
        refreshToken: registrationApiResponse.refreshToken,
        authenticatedEmployee: {
          _id:      registrationApiResponse.tenant._id,
          fullName: adminFullNameInputValue,
          role:     'admin',
          tenantId: registrationApiResponse.tenant._id,
        },
        restaurantTenant: {
          restaurantTenantIdentifier:   registrationApiResponse.tenant._id,
          restaurantTenantName:         registrationApiResponse.tenant.name,
          restaurantTenantAddress:      registrationApiResponse.tenant.address,
          restaurantTenantContactEmail: registrationApiResponse.tenant.contactEmail,
          restaurantTenantCuisineType:  registrationApiResponse.tenant.cuisineType,
          restaurantTenantLogoUrl:      registrationApiResponse.tenant.logoUrl,
        },
      });

      document.cookie = `accessToken=${registrationApiResponse.accessToken}; path=/; max-age=${15 * 60}`;

      emitToastNotification(`Restaurant registered! Welcome, ${adminFullNameInputValue}!`, 'success');
      routerInstance.replace('/dashboard');
    } catch (registrationApiError: unknown) {
      const errorResponse = registrationApiError as { response?: { data?: { message?: string } } };
      setRegistrationErrorMessage(
        errorResponse?.response?.data?.message ?? 'Registration failed. Please check your details and try again.'
      );
    } finally {
      setIsRegistrationRequestPending(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    height: '46px',
    padding: '0 14px',
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid var(--border)',
    background: 'var(--surface-secondary)',
    color: '#111827',
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    transition: 'border-color 150ms, background 150ms',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.7px',
  };

  function handleInputFocus(e: React.FocusEvent<HTMLInputElement>): void {
    e.target.style.borderColor = 'var(--tenant-accent)';
    e.target.style.background = '#FFFFFF';
  }

  function handleInputBlur(e: React.FocusEvent<HTMLInputElement>): void {
    e.target.style.borderColor = 'var(--border)';
    e.target.style.background = 'var(--surface-secondary)';
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0D1312 0%, #111C1A 100%)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 24px',
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

      <div style={{ width: '100%', maxWidth: '540px', position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="ExpediteHub Logo"
              width={32}
              height={32}
              style={{ borderRadius: 'var(--radius-sm)', objectFit: 'contain' }}
            />
            <span style={{ fontWeight: 700, fontSize: '20px', color: '#FFFFFF', letterSpacing: '-0.3px' }}>
              ExpediteHub
            </span>
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
              Register your restaurant
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '28px' }}>
              Create your tenant workspace and your first admin account.
            </p>

            <form onSubmit={handleRegistrationFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* ── Restaurant Details section ── */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                margin: '4px 0 2px',
              }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--tenant-accent)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  flexShrink: 0,
                }}>
                  Restaurant Details
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="register-restaurant-name" style={labelStyle}>Restaurant Name *</label>
                <input id="register-restaurant-name" type="text" required value={tenantNameInputValue}
                  onChange={(ev) => setTenantNameInputValue(ev.target.value)}
                  placeholder="The Golden Griddle" style={inputStyle}
                  onFocus={handleInputFocus} onBlur={handleInputBlur} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="register-restaurant-address" style={labelStyle}>Address *</label>
                <input id="register-restaurant-address" type="text" required value={tenantAddressInputValue}
                  onChange={(ev) => setTenantAddressInputValue(ev.target.value)}
                  placeholder="123 Main Street, City" style={inputStyle}
                  onFocus={handleInputFocus} onBlur={handleInputBlur} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="register-contact-email" style={labelStyle}>Contact Email *</label>
                  <input id="register-contact-email" type="email" required value={tenantContactEmailInputValue}
                    onChange={(ev) => setTenantContactEmailInputValue(ev.target.value)}
                    placeholder="hello@restaurant.com" style={inputStyle}
                    onFocus={handleInputFocus} onBlur={handleInputBlur} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="register-cuisine-type" style={labelStyle}>Cuisine Type</label>
                  <input id="register-cuisine-type" type="text" value={tenantCuisineTypeInputValue}
                    onChange={(ev) => setTenantCuisineTypeInputValue(ev.target.value)}
                    placeholder="Italian, Burgers…" style={inputStyle}
                    onFocus={handleInputFocus} onBlur={handleInputBlur} />
                </div>
              </div>

              {/* ── Admin Account section ── */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                margin: '8px 0 2px',
              }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--tenant-accent)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  flexShrink: 0,
                }}>
                  Admin Account
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="register-admin-name" style={labelStyle}>Full Name *</label>
                <input id="register-admin-name" type="text" required value={adminFullNameInputValue}
                  onChange={(ev) => setAdminFullNameInputValue(ev.target.value)}
                  placeholder="Jane Smith" style={inputStyle}
                  onFocus={handleInputFocus} onBlur={handleInputBlur} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="register-admin-email" style={labelStyle}>Admin Email *</label>
                  <input id="register-admin-email" type="email" required value={adminEmailInputValue}
                    onChange={(ev) => setAdminEmailInputValue(ev.target.value)}
                    placeholder="admin@restaurant.com" style={inputStyle}
                    onFocus={handleInputFocus} onBlur={handleInputBlur} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="register-admin-password" style={labelStyle}>Password * (min 6)</label>
                  <div style={{ position: 'relative' }}>
                    <input id="register-admin-password"
                      type={isPasswordVisible ? 'text' : 'password'}
                      required value={adminPasswordInputValue}
                      onChange={(ev) => setAdminPasswordInputValue(ev.target.value)}
                      placeholder="••••••••"
                      style={{ ...inputStyle, paddingRight: '42px' }}
                      onFocus={handleInputFocus} onBlur={handleInputBlur} />
                    <button
                      type="button"
                      onClick={() => setIsPasswordVisible((v) => !v)}
                      aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: '#9CA3AF', padding: '4px', display: 'flex', alignItems: 'center',
                      }}
                    >
                      {isPasswordVisible ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {registrationErrorMessage && (
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
                  {registrationErrorMessage}
                </div>
              )}

              <button
                id="register-submit-button"
                type="submit"
                disabled={isRegistrationRequestPending}
                style={{
                  height: '48px',
                  background: 'var(--tenant-accent)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: isRegistrationRequestPending ? 'not-allowed' : 'pointer',
                  opacity: isRegistrationRequestPending ? 0.7 : 1,
                  marginTop: '8px',
                  transition: 'opacity 150ms',
                  letterSpacing: '0.2px',
                }}
              >
                {isRegistrationRequestPending ? 'Registering…' : 'Register Restaurant'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6B7280' }}>
              Already registered?{' '}
              <Link href="/login" style={{ color: 'var(--tenant-accent)', textDecoration: 'none', fontWeight: 600 }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
