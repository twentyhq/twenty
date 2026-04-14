import { FooterVisibilityGate } from '@/app/_components/FooterVisibilityGate';
import { FOOTER_DATA } from '@/app/_constants/footer';
import { ContactCalModalRoot } from '@/app/components/ContactCalModal';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
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

css`
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
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

const StyledMain = styled.main`
  flex-grow: 1;
`;

export const metadata: Metadata = {
  title: 'Twenty — Open Source CRM',
  description: 'Modular, scalable open source CRM for modern teams.',
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const stats = await fetchCommunityStats();
  const footerSocialLinks = mergeSocialLinkLabels(
    FOOTER_DATA.socialLinks,
    stats,
  );

  return (
    <html lang="en">
      <body
        className={`${cssVariables} ${hostGrotesk.variable} ${aleo.variable} ${azeretMono.variable} ${vt323.variable}`}
        suppressHydrationWarning
      >
        <ContactCalModalRoot>
          <StyledMain>{children}</StyledMain>
          <FooterVisibilityGate>
            <Footer.Root illustration={FOOTER_DATA.illustration}>
              <Footer.Logo />
              <Footer.Nav groups={FOOTER_DATA.navGroups} />
              <Footer.Bottom
                copyright={FOOTER_DATA.bottom.copyright}
                links={footerSocialLinks}
              />
            </Footer.Root>
          </FooterVisibilityGate>
        </ContactCalModalRoot>
      </body>
    </html>
  );
}
