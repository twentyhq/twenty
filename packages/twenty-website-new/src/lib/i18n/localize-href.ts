import { type AppLocale } from 'twenty-shared/translations';

import { APP_LOCALE_BY_RAW } from './app-locale-set';

export const localizeHref = (locale: AppLocale, href: string): string => {
  if (!href.startsWith('/') || href.startsWith('//')) return href;

  const firstSlash = href.indexOf('/', 1);
  const firstSegment =
    firstSlash === -1 ? href.slice(1) : href.slice(1, firstSlash);
  if (APP_LOCALE_BY_RAW.has(firstSegment)) return href;

  return `/${locale}${href}`;
};

export const stripLocale = (pathname: string): string => {
  if (!pathname.startsWith('/')) return pathname;

  const firstSlash = pathname.indexOf('/', 1);
  const firstSegment =
    firstSlash === -1 ? pathname.slice(1) : pathname.slice(1, firstSlash);
  if (!APP_LOCALE_BY_RAW.has(firstSegment)) return pathname;

  if (firstSlash === -1) return '/';
  return pathname.slice(firstSlash);
};
