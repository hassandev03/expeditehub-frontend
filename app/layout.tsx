import type { Metadata } from 'next';
import './globals.css';
import ApplicationProviders from './providers';

export const metadata: Metadata = {
  title: 'ExpediteHub — Restaurant Management System',
  description:
    'Multi-tenant Kitchen Display and Ordering System. Manage your restaurant staff, menu, orders, and analytics in real time.',
  keywords: ['restaurant management', 'kitchen display system', 'KDS', 'POS', 'ordering system'],
  icons: {
    icon: '/logo.png',
  },
};

interface RootLayoutProperties {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProperties) {
  return (
    <html lang="en">
      <head>
        {/* Satoshi from Fontshare */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap"
          rel="stylesheet"
        />
        {/* Inter from Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Favicon */}
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="shortcut icon" href="/logo.png" type="image/png" />
      </head>
      <body>
        <ApplicationProviders>{children}</ApplicationProviders>
      </body>
    </html>
  );
}
