import { css } from '@linaria/core';
import { Aleo, Azeret_Mono, Host_Grotesk, VT323 } from 'next/font/google';
import localFont from 'next/font/local';
import { type ReactNode } from 'react';

import { getLocaleMessages } from '@/platform/i18n/get-locale-messages';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { ContactCalModalRoot } from '@/contact-cal';
import { I18nProvider } from '@/platform/i18n/I18nProvider';
import { localeToUrlSegment } from '@/platform/i18n/locale-to-url-segment';
import { resolveLocaleParam } from '@/platform/i18n/resolve-locale-param';
import { WEBSITE_LOCALE_LIST } from '@/platform/i18n/website-locale-list';
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

const vt323 = VT323({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-retro',
  display: 'swap',
});

// Inter is twenty-front's product font; the app-preview/CRM mockups render in it
// (exposed as --font-product so the preview surfaces can rebind to it). Pinned to
// the exact classic Inter (v12, weights 400/500/600) twenty-front self-hosts, so
// the mockups match the product pixel-for-pixel rather than Google's current Inter.
const inter = localFont({
  src: [
    {
      path: '../../fonts/inter-latin-400.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../fonts/inter-latin-500.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../fonts/inter-latin-600.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-product',
  display: 'swap',
});

const globalStyles = css`
  /* One root rule instead of per-component guards: motion collapses to
     instant for users who prefer reduced motion. State still applies;
     only the travel disappears. */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }

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

export const dynamicParams = false;

export const generateStaticParams = (): LocaleRouteParams[] =>
  WEBSITE_LOCALE_LIST.map((locale) => ({
    locale: localeToUrlSegment(locale),
  }));

const LocaleLayout = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<LocaleRouteParams>;
}) => {
  await getRouteI18n(params);
  const locale = resolveLocaleParam((await params).locale);

  return (
    <html lang={locale}>
      <body
        className={`${tokenCssVariables} ${globalStyles} ${hostGrotesk.variable} ${aleo.variable} ${azeretMono.variable} ${vt323.variable} ${inter.variable}`}
      >
        <I18nProvider locale={locale} messages={getLocaleMessages(locale)}>
          <ContactCalModalRoot>{children}</ContactCalModalRoot>
        </I18nProvider>
      </body>
    </html>
  );
};

export default LocaleLayout;
