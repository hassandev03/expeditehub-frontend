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

  const sharedInputStyle: React.CSSProperties = {
    height: '48px',
    padding: '0 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--kds-border)',
    background: 'var(--kds-bg)',
    color: 'var(--kds-text-primary)',
    fontFamily: 'var(--font-body)',
    fontSize: '15px',
    outline: 'none',
    width: '100%',
  };

  const sharedLabelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--kds-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0C1110 0%, #111C1A 100%)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 24px',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '540px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px', height: '32px', background: 'var(--tenant-accent)',
                borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 700, fontSize: '16px', color: '#FFFFFF',
              }}
            >E</div>
            <span style={{ fontWeight: 600, fontSize: '18px', color: 'var(--kds-text-primary)' }}>
              ExpediteHub
            </span>
          </Link>
        </div>

        <div
          style={{
            background: 'var(--kds-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--kds-border)',
            padding: '36px',
          }}
        >
          <h1 style={{ fontWeight: 600, fontSize: '22px', color: 'var(--kds-text-primary)', marginBottom: '6px' }}>
            Register your restaurant
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--kds-text-secondary)', marginBottom: '28px' }}>
            Create your tenant workspace and your first admin account.
          </p>

          <form onSubmit={handleRegistrationFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* ─ Restaurant Info ─ */}
            <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--tenant-accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Restaurant Details
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="register-restaurant-name" style={sharedLabelStyle}>Restaurant Name *</label>
              <input id="register-restaurant-name" type="text" required value={tenantNameInputValue}
                onChange={(ev) => setTenantNameInputValue(ev.target.value)}
                placeholder="The Golden Griddle" style={sharedInputStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="register-restaurant-address" style={sharedLabelStyle}>Address *</label>
              <input id="register-restaurant-address" type="text" required value={tenantAddressInputValue}
                onChange={(ev) => setTenantAddressInputValue(ev.target.value)}
                placeholder="123 Main Street, City" style={sharedInputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="register-contact-email" style={sharedLabelStyle}>Contact Email *</label>
                <input id="register-contact-email" type="email" required value={tenantContactEmailInputValue}
                  onChange={(ev) => setTenantContactEmailInputValue(ev.target.value)}
                  placeholder="hello@restaurant.com" style={sharedInputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="register-cuisine-type" style={sharedLabelStyle}>Cuisine Type</label>
                <input id="register-cuisine-type" type="text" value={tenantCuisineTypeInputValue}
                  onChange={(ev) => setTenantCuisineTypeInputValue(ev.target.value)}
                  placeholder="Italian, Burgers…" style={sharedInputStyle} />
              </div>
            </div>

            {/* ─ Admin Account ─ */}
            <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--tenant-accent)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '8px' }}>
              Admin Account
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="register-admin-name" style={sharedLabelStyle}>Full Name *</label>
              <input id="register-admin-name" type="text" required value={adminFullNameInputValue}
                onChange={(ev) => setAdminFullNameInputValue(ev.target.value)}
                placeholder="Jane Smith" style={sharedInputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="register-admin-email" style={sharedLabelStyle}>Admin Email *</label>
                <input id="register-admin-email" type="email" required value={adminEmailInputValue}
                  onChange={(ev) => setAdminEmailInputValue(ev.target.value)}
                  placeholder="admin@restaurant.com" style={sharedInputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="register-admin-password" style={sharedLabelStyle}>Password * (min 6)</label>
                <input id="register-admin-password" type="password" required value={adminPasswordInputValue}
                  onChange={(ev) => setAdminPasswordInputValue(ev.target.value)}
                  placeholder="••••••••" style={sharedInputStyle} />
              </div>
            </div>

            {registrationErrorMessage && (
              <p style={{ fontSize: '14px', color: '#EF4444', background: 'rgba(239, 68, 68, 0.1)', padding: '10px 14px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid #EF4444' }}>
                {registrationErrorMessage}
              </p>
            )}

            <button
              id="register-submit-button"
              type="submit"
              disabled={isRegistrationRequestPending}
              style={{
                height: '48px', background: 'var(--tenant-accent)', color: '#FFFFFF',
                borderRadius: 'var(--radius-md)', border: 'none',
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '15px',
                cursor: isRegistrationRequestPending ? 'not-allowed' : 'pointer',
                opacity: isRegistrationRequestPending ? 0.7 : 1, marginTop: '8px',
              }}
            >
              {isRegistrationRequestPending ? 'Registering…' : 'Register Restaurant'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--kds-text-secondary)' }}>
            Already registered?{' '}
            <Link href="/login" style={{ color: 'var(--tenant-accent)', textDecoration: 'none', fontWeight: 500 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
