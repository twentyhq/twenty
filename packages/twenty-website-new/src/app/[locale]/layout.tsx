import {
  buildOrganizationJsonLd,
  buildSoftwareApplicationJsonLd,
  getSiteUrl,
  JsonLd,
} from '@/lib/seo';
import { DRACO_DECODER_ORIGIN } from '@/lib/visual-runtime/draco-decoder-path';
import { theme } from '@/theme';
import { cssVariables } from '@/theme/css-variables';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import type { Metadata } from 'next';
import { Aleo, Azeret_Mono, Host_Grotesk, VT323 } from 'next/font/google';
import { type ReactNode } from 'react';

import { FooterVisibilityGate } from '@/app/_components/FooterVisibilityGate';
import { ScrollToTopOnRouteChange } from '@/app/_components/ScrollToTopOnRouteChange';
import { ContactCalModalRoot } from '@/lib/contact-cal';
import { createMessageDescriptorRenderer } from '@/lib/i18n/create-message-descriptor-renderer';
import {
  I18nProvider,
  PUBLIC_APP_LOCALE_LIST,
  localeToUrlSegment,
  resolveLocaleParam,
} from '@/lib/i18n';
import { getLocaleMessages } from '@/lib/i18n/messages-by-locale';
import { setServerI18n } from '@/lib/i18n/set-server-i18n';
import { PartnerApplicationModalRoot } from '@/lib/partner-application';
import { Footer } from '@/sections/Footer/components';
import { FOOTER_DATA } from '@/sections/Footer/data';

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
    min-height: 100vh;
    min-height: 100dvh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

const StyledMain = styled.main`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const SITE_TITLE = 'Twenty | #1 Open Source CRM';
const SITE_DESCRIPTION =
  'The #1 Open Source CRM for modern teams. Modular, scalable, and built to fit your business.';

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

type LocaleLayoutParams = { locale: string };

export const dynamicParams = false;

export const generateStaticParams = (): LocaleLayoutParams[] =>
  PUBLIC_APP_LOCALE_LIST.map((locale) => ({
    locale: localeToUrlSegment(locale),
  }));

const LocaleLayout = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<LocaleLayoutParams>;
}) => {
  const { locale: rawLocale } = await params;
  const locale = resolveLocaleParam(rawLocale);
  const i18n = setServerI18n(locale);
  const renderText = createMessageDescriptorRenderer(i18n);
  const messages = getLocaleMessages(locale);

  return (
    <html lang={locale}>
      <head>
        <link
          crossOrigin="anonymous"
          href={DRACO_DECODER_ORIGIN}
          rel="preconnect"
        />
        <JsonLd
          data={[buildOrganizationJsonLd(), buildSoftwareApplicationJsonLd()]}
        />
      </head>
      <body
        className={`${cssVariables} ${hostGrotesk.variable} ${aleo.variable} ${azeretMono.variable} ${vt323.variable}`}
        suppressHydrationWarning
      >
        <I18nProvider locale={locale} messages={messages}>
          <ContactCalModalRoot>
            <PartnerApplicationModalRoot>
              <ScrollToTopOnRouteChange />
              <StyledMain>{children}</StyledMain>
              <FooterVisibilityGate>
                <Footer.Root>
                  <Footer.Logo />
                  <Footer.Nav
                    groups={FOOTER_DATA.navGroups}
                    renderText={renderText}
                  />
                  <Footer.Bottom
                    copyright={FOOTER_DATA.bottom.copyright}
                    links={FOOTER_DATA.socialLinks}
                    renderText={renderText}
                  />
                </Footer.Root>
              </FooterVisibilityGate>
            </PartnerApplicationModalRoot>
          </ContactCalModalRoot>
        </I18nProvider>
      </body>
    </html>
  );
};

export default LocaleLayout;
