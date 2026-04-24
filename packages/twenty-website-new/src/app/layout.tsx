import { FooterVisibilityGate } from '@/app/_components/FooterVisibilityGate';
import { ScrollToTopOnRouteChange } from '@/app/_components/ScrollToTopOnRouteChange';
import { FOOTER_DATA } from '@/sections/Footer/data';
import { ContactCalModalRoot } from '@/lib/contact-cal';
import { PartnerApplicationModalRoot } from '@/lib/partner-application';
import { getSiteUrl } from '@/lib/seo';
import { DRACO_DECODER_ORIGIN } from '@/lib/visual-runtime/draco-decoder-path';
import { Footer } from '@/sections/Footer/components';
import { theme } from '@/theme';
import { cssVariables } from '@/theme/css-variables';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import type { Metadata } from 'next';
import { Aleo, Azeret_Mono, Host_Grotesk, VT323 } from 'next/font/google';

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

const vt323 = VT323({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-retro',
  display: 'swap',
});

const _globalStyles = css`
  :global(*),
  :global(*::before),
  :global(*::after) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(html) {
    background-color: ${theme.colors.primary.background[100]};
  }

  :global(body) {
    color: ${theme.colors.primary.text[100]};
    display: flex;
    font-family: ${theme.font.family.sans};
    flex-direction: column;
    /* dvh keeps the footer pinned to the visible viewport bottom on mobile
     * Safari (where 100vh = large viewport with chrome hidden, leaving a
     * gap when the URL bar is showing). vh fallback for older browsers. */
    min-height: 100vh;
    min-height: 100dvh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

const StyledMain = styled.main`
  flex-grow: 1;
`;

const SITE_TITLE = 'Twenty | #1 open source CRM';
const SITE_DESCRIPTION =
  'The #1 open source CRM for modern teams. Modular, scalable, and built to fit your business.';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_TITLE,
    template: '%s | Twenty',
  },
  description: SITE_DESCRIPTION,
  applicationName: 'Twenty',
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: '/',
    siteName: 'Twenty',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: '@twentycrm',
    creator: '@twentycrm',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/*
         * Warm up the connection to the DRACO decoder host so the first 3D
         * model on the page does not pay the full TLS handshake cost the
         * moment it starts decoding.
         */}
        <link
          crossOrigin="anonymous"
          href={DRACO_DECODER_ORIGIN}
          rel="preconnect"
        />
      </head>
      <body
        className={`${cssVariables} ${hostGrotesk.variable} ${aleo.variable} ${azeretMono.variable} ${vt323.variable}`}
        suppressHydrationWarning
      >
        <ContactCalModalRoot>
          <PartnerApplicationModalRoot>
            <ScrollToTopOnRouteChange />
            <StyledMain>{children}</StyledMain>
            <FooterVisibilityGate>
              <Footer.Root>
                <Footer.Logo />
                <Footer.Nav groups={FOOTER_DATA.navGroups} />
                <Footer.Bottom
                  copyright={FOOTER_DATA.bottom.copyright}
                  links={FOOTER_DATA.socialLinks}
                />
              </Footer.Root>
            </FooterVisibilityGate>
          </PartnerApplicationModalRoot>
        </ContactCalModalRoot>
      </body>
    </html>
  );
}
