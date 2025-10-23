import { Providers } from '@/components/providers';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
};

export const metadata: Metadata = {
  title: 'PWR Finanças - Gestão Financeira Pessoal',
  description: 'Sistema completo de gestão financeira pessoal com suporte offline',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PWR Finanças',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      {/* head is handled by Next.js metadata API */}
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
