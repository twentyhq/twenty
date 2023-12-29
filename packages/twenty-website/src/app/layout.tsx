import type { Metadata } from 'next';
import { Gabarito } from 'next/font/google';
import EmotionRootStyleRegistry from './emotion-root-style-registry';
import { HeaderDesktop } from './components/HeaderDesktop';
import { FooterDesktop } from './components/FooterDesktop';
import { HeaderMobile } from '@/app/components/HeaderMobile';
import './layout.css';

export const metadata: Metadata = {
  title: 'Twenty.dev',
  description: 'Twenty for Developer',
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
