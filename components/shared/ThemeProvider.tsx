'use client';

import { useEffect } from 'react';
import { useAuthenticationStore } from '@/lib/auth/authenticationStore';

export default function ThemeProvider() {
  const restaurantTenant = useAuthenticationStore((authState) => authState.restaurantTenant);

  useEffect(() => {
    const tenantBrandColor = restaurantTenant?.restaurantTenantBrandColor;
    if (tenantBrandColor) {
      document.documentElement.style.setProperty('--tenant-accent', tenantBrandColor);
      document.documentElement.style.setProperty('--tenant-accent-hover', tenantBrandColor);
    } else {
      document.documentElement.style.removeProperty('--tenant-accent');
      document.documentElement.style.removeProperty('--tenant-accent-hover');
    }
  }, [restaurantTenant]);

  return null;
}
