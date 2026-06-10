import { css } from '@linaria/core';
import type { Metadata } from 'next';
import { Aleo, Azeret_Mono, Host_Grotesk } from 'next/font/google';
import { type ReactNode } from 'react';

import { color, fontFamily, tokenCssVariables } from '@/tokens';

const hostGrotesk = Host_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const aleo = Aleo({
  subsets: ['latin'],
  weight: ['300'],
  variable: '--font-serif',
  display: 'swap',
});

const azeretMono = Azeret_Mono({
  subsets: ['latin'],
  weight: ['300', '500'],
  variable: '--font-mono',
  display: 'swap',
});

const globalStyles = css`
  :global(*),
  :global(*::before),
  :global(*::after) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(body) {
    background-color: ${color('white')};
    color: ${color('black')};
    font-family: ${fontFamily('sans')};
    min-height: 100vh;
    min-height: 100dvh;
    -webkit-font-smoothing: antialiased;
  }
`;

export const metadata: Metadata = {
  title: 'Twenty — website rebuild',
  description: 'Ground-up rebuild of the Twenty marketing site.',
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <body
      className={`${tokenCssVariables} ${globalStyles} ${hostGrotesk.variable} ${aleo.variable} ${azeretMono.variable}`}
    >
      {children}
    </body>
  </html>
);

export default RootLayout;
