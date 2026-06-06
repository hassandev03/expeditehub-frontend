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
    height: '48px', // slightly smaller than login to fit more fields
    padding: '0 14px',
    borderRadius: 'var(--radius-lg)',
    border: '1.5px solid #E5E1D8',
    background: '#FFFFFF',
    color: '#1C1915',
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    transition: 'all 200ms ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    color: '#4A443B',
    letterSpacing: '0.3px',
  };

  function handleInputFocus(e: React.FocusEvent<HTMLInputElement>): void {
    e.target.style.borderColor = 'var(--tenant-accent)';
    e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--tenant-accent) 15%, transparent)';
  }

  function handleInputBlur(e: React.FocusEvent<HTMLInputElement>): void {
    e.target.style.borderColor = '#E5E1D8';
    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', background: '#FCFAF5', fontFamily: 'var(--font-body)' }}>
      {/* Left Image Section */}
      <div style={{
        flex: 1,
        position: 'relative',
        display: 'none',
      }} className="auth-image-container">
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
        maxWidth: '680px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px 60px',
        background: '#FCFAF5',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '540px', margin: '0 auto' }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="ExpediteHub Logo" width={40} height={40} style={{ borderRadius: 'var(--radius-sm)', objectFit: 'contain' }} />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '24px', color: '#1C1915', letterSpacing: '-0.5px' }}>
              ExpediteHub
            </span>
          </Link>

          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '32px', color: '#1C1915', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Register your restaurant
            </h1>
            <p style={{ fontSize: '15px', color: '#736B5E', marginBottom: '32px' }}>
              Create your tenant workspace and your first admin account.
            </p>

            <form onSubmit={handleRegistrationFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* ── Restaurant Details section ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0 2px' }}>
                <div style={{ flex: 1, height: '1px', background: '#E5E1D8' }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--tenant-accent)', textTransform: 'uppercase', letterSpacing: '1px', flexShrink: 0 }}>
                  Restaurant Details
                </span>
                <div style={{ flex: 1, height: '1px', background: '#E5E1D8' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="register-restaurant-name" style={labelStyle}>Restaurant Name *</label>
                <input id="register-restaurant-name" type="text" required value={tenantNameInputValue}
                  onChange={(ev) => setTenantNameInputValue(ev.target.value)}
                  placeholder="The Golden Griddle" style={inputStyle}
                  onFocus={handleInputFocus} onBlur={handleInputBlur} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="register-restaurant-address" style={labelStyle}>Address *</label>
                <input id="register-restaurant-address" type="text" required value={tenantAddressInputValue}
                  onChange={(ev) => setTenantAddressInputValue(ev.target.value)}
                  placeholder="123 Main Street, City" style={inputStyle}
                  onFocus={handleInputFocus} onBlur={handleInputBlur} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="register-contact-email" style={labelStyle}>Contact Email *</label>
                  <input id="register-contact-email" type="email" required value={tenantContactEmailInputValue}
                    onChange={(ev) => setTenantContactEmailInputValue(ev.target.value)}
                    placeholder="hello@restaurant.com" style={inputStyle}
                    onFocus={handleInputFocus} onBlur={handleInputBlur} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="register-cuisine-type" style={labelStyle}>Cuisine Type</label>
                  <input id="register-cuisine-type" type="text" value={tenantCuisineTypeInputValue}
                    onChange={(ev) => setTenantCuisineTypeInputValue(ev.target.value)}
                    placeholder="Italian, Burgers…" style={inputStyle}
                    onFocus={handleInputFocus} onBlur={handleInputBlur} />
                </div>
              </div>

              {/* ── Admin Account section ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '12px 0 2px' }}>
                <div style={{ flex: 1, height: '1px', background: '#E5E1D8' }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--tenant-accent)', textTransform: 'uppercase', letterSpacing: '1px', flexShrink: 0 }}>
                  Admin Account
                </span>
                <div style={{ flex: 1, height: '1px', background: '#E5E1D8' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="register-admin-name" style={labelStyle}>Full Name *</label>
                <input id="register-admin-name" type="text" required value={adminFullNameInputValue}
                  onChange={(ev) => setAdminFullNameInputValue(ev.target.value)}
                  placeholder="Jane Smith" style={inputStyle}
                  onFocus={handleInputFocus} onBlur={handleInputBlur} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="register-admin-email" style={labelStyle}>Admin Email *</label>
                  <input id="register-admin-email" type="email" required value={adminEmailInputValue}
                    onChange={(ev) => setAdminEmailInputValue(ev.target.value)}
                    placeholder="admin@restaurant.com" style={inputStyle}
                    onFocus={handleInputFocus} onBlur={handleInputBlur} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
              </div>

              {registrationErrorMessage && (
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
                  {registrationErrorMessage}
                </div>
              )}

              <button
                id="register-submit-button"
                type="submit"
                disabled={isRegistrationRequestPending}
                style={{
                  height: '52px',
                  background: 'var(--tenant-accent)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: 'none',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: '16px',
                  cursor: isRegistrationRequestPending ? 'not-allowed' : 'pointer',
                  opacity: isRegistrationRequestPending ? 0.7 : 1,
                  marginTop: '12px',
                  transition: 'opacity 200ms, transform 100ms',
                  boxShadow: '0 4px 12px color-mix(in srgb, var(--tenant-accent) 40%, transparent)',
                }}
              >
                {isRegistrationRequestPending ? 'Registering…' : 'Register Restaurant'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '15px', color: '#736B5E' }}>
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
