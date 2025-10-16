'use client';

import { AuthProvider } from '@/lib/auth-context';
import { PWAProvider } from '@/lib/pwa-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PWAProvider>{children}</PWAProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
