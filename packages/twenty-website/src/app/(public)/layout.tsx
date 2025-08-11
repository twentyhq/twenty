import { type Metadata } from 'next';
import { PublicEnvScript } from 'next-runtime-env';
import { Gabarito, Inter } from 'next/font/google';

import { AppHeader } from '@/app/_components/ui/layout/header';

import { FooterDesktop } from '../_components/ui/layout/FooterDesktop';
import EmotionRootStyleRegistry from '../emotion-root-style-registry';

import './layout.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Twenty.com',
  description: 'Open Source CRM',
  icons: '/images/core/logo.svg',
};

const gabarito = Gabarito({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
  variable: '--font-gabarito',
});

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${gabarito.variable} ${inter.variable}`}>
      <body>
        <PublicEnvScript />
        <EmotionRootStyleRegistry>
          <AppHeader />
          <div className="container">{children}</div>
          <FooterDesktop />
        </EmotionRootStyleRegistry>
      </body>
    </html>
  );
}
