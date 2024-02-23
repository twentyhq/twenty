import { Metadata } from 'next';
import { Gabarito, Inter } from 'next/font/google';

import { HeaderMobile } from '@/app/components/HeaderMobile';

import { FooterDesktop } from './components/FooterDesktop';
import { HeaderDesktop } from './components/HeaderDesktop';
import EmotionRootStyleRegistry from './emotion-root-style-registry';

import './layout.css';

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
    <html lang="en" className={`${gabarito.className} ${inter.className}`}>
      <body>
        <EmotionRootStyleRegistry>
          <HeaderDesktop />
          <div className="container">
            <HeaderMobile />
            {children}
          </div>
          <FooterDesktop />
        </EmotionRootStyleRegistry>
      </body>
    </html>
  );
}
