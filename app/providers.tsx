'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ThemeProvider from '@/components/shared/ThemeProvider';

interface ApplicationProvidersProperties {
  children: React.ReactNode;
}

export default function ApplicationProviders({
  children,
}: ApplicationProvidersProperties): React.JSX.Element {
  // QueryClient is created once per session, not re-created on re-renders
  const [reactQueryClientInstance] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={reactQueryClientInstance}>
      <ThemeProvider />
      {children}
    </QueryClientProvider>
  );
}
