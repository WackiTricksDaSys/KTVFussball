import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KTV Fußball',
  description: 'Vereins-Management für KTV Fußball',
  manifest: '/manifest.json',
  icons: {
    icon: '/fussball.ico',
    apple: '/fussball.ico',
  },
  themeColor: '#DC2626',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KTV Fußball'
  }
};

// Remove viewport from metadata and export it separately
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
