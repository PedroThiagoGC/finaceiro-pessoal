'use client';

import { ReactNode, useEffect } from 'react';
import { Workbox } from 'workbox-window';

export function PWAProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      const wb = new Workbox('/sw.js');

      wb.addEventListener('installed', event => {
        if (event.isUpdate) {
          if (confirm('Nova versão disponível! Atualizar?')) {
            window.location.reload();
          }
        }
      });

      wb.register();
    }
  }, []);

  return <>{children}</>;
}
