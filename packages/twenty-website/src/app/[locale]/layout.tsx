import { css } from '@linaria/core';
import localFont from 'next/font/local';
import { type ReactNode } from 'react';

import { MESSAGES_BY_LOCALE } from '@/platform/i18n/messages-by-locale';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { ContactCalModalRoot } from '@/contact-cal';
import { I18nProvider } from '@/platform/i18n/I18nProvider';
import { resolveLocaleParam } from '@/platform/i18n/resolve-locale-param';
import { WEBSITE_LOCALE_LIST } from '@/platform/i18n/website-locale-list';
import { color, fontFamily, tokenCssVariables } from '@/tokens';

// Host Grotesk and Azeret Mono are variable fonts, declared over their full
// wght axis so the browser interpolates every weight the site asks for.
const hostGrotesk = localFont({
  src: '../../fonts/host-grotesk-latin-variable.woff2',
  weight: '300 800',
  style: 'normal',
  variable: '--font-sans',
  display: 'swap',
});

const aleo = localFont({
  src: '../../fonts/aleo-latin-300.woff2',
  weight: '300',
  style: 'normal',
  variable: '--font-serif',
  display: 'swap',
});

const azeretMono = localFont({
  src: '../../fonts/azeret-mono-latin-variable.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-mono',
  display: 'swap',
});

const vt323 = localFont({
  src: '../../fonts/vt323-latin-400.woff2',
  weight: '400',
  style: 'normal',
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
  WEBSITE_LOCALE_LIST.map((locale) => ({ locale }));

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
        <I18nProvider locale={locale} messages={MESSAGES_BY_LOCALE[locale]}>
          <ContactCalModalRoot>{children}</ContactCalModalRoot>
        </I18nProvider>
      </body>
    </html>
  );
};

export default LocaleLayout;
