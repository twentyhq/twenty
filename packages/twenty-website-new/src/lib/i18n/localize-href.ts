import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import { APP_LOCALE_BY_RAW } from './app-locale-set';

export const localizeHref = (locale: AppLocale, href: string): string => {
  if (!href.startsWith('/') || href.startsWith('//')) return href;

  const firstSlash = href.indexOf('/', 1);
  const firstSegment =
    firstSlash === -1 ? href.slice(1) : href.slice(1, firstSlash);
  const existingLocale = APP_LOCALE_BY_RAW.get(firstSegment);

  if (existingLocale !== undefined && existingLocale !== SOURCE_LOCALE) {
    return href;
  }

  const unprefixed =
    existingLocale === SOURCE_LOCALE
      ? firstSlash === -1
        ? '/'
        : href.slice(firstSlash)
      : href;

  return locale === SOURCE_LOCALE ? unprefixed : `/${locale}${unprefixed}`;
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
