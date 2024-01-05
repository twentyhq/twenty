import { Metadata } from 'next';
import { Gabarito } from 'next/font/google';

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
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={gabarito.className}>
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
