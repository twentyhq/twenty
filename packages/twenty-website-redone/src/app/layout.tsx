import { css } from '@linaria/core';
import type { Metadata } from 'next';
import { type ReactNode } from 'react';

import { color, tokenCssVariables } from '@/tokens';

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
    font-family: system-ui, sans-serif;
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
    <body className={`${tokenCssVariables} ${globalStyles}`}>{children}</body>
  </html>
);

export default RootLayout;
