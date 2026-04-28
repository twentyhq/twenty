import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import { APP_LOCALE_BY_RAW } from './app-locale-set';

const findFirstSegmentEnd = (path: string): number => {
  for (let i = 1; i < path.length; i += 1) {
    const ch = path[i];
    if (ch === '/' || ch === '?' || ch === '#') return i;
  }
  return path.length;
};

const buildTailFromSegmentEnd = (path: string, segmentEnd: number): string => {
  const tail = path.slice(segmentEnd);
  if (tail.length === 0) return '/';
  if (tail.startsWith('?') || tail.startsWith('#')) return `/${tail}`;
  return tail;
};

export const localizeHref = (locale: AppLocale, href: string): string => {
  if (!href.startsWith('/') || href.startsWith('//')) return href;

  const segmentEnd = findFirstSegmentEnd(href);
  const firstSegment = href.slice(1, segmentEnd);
  const existingLocale = APP_LOCALE_BY_RAW.get(firstSegment);

  if (existingLocale !== undefined && existingLocale !== SOURCE_LOCALE) {
    return href;
  }

  const unprefixed =
    existingLocale === SOURCE_LOCALE
      ? buildTailFromSegmentEnd(href, segmentEnd)
      : href;

  return locale === SOURCE_LOCALE ? unprefixed : `/${locale}${unprefixed}`;
};

export const stripLocale = (pathname: string): string => {
  if (!pathname.startsWith('/')) return pathname;

  const segmentEnd = findFirstSegmentEnd(pathname);
  const firstSegment = pathname.slice(1, segmentEnd);
  if (!APP_LOCALE_BY_RAW.has(firstSegment)) return pathname;

  return buildTailFromSegmentEnd(pathname, segmentEnd);
};
