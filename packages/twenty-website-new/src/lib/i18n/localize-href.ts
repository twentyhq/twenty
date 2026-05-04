import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import {
  KNOWN_PUBLIC_APP_LOCALE_BY_RAW,
  isPublicAppLocale,
} from './app-locale-set';

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
  const existingLocale = KNOWN_PUBLIC_APP_LOCALE_BY_RAW.get(firstSegment);

  const unprefixed =
    existingLocale !== undefined
      ? buildTailFromSegmentEnd(href, segmentEnd)
      : href;

  if (locale === SOURCE_LOCALE || !isPublicAppLocale(locale)) {
    return unprefixed;
  }

  return unprefixed === '/' ? `/${locale}` : `/${locale}${unprefixed}`;
};

export const stripLocale = (pathname: string): string => {
  if (!pathname.startsWith('/')) return pathname;

  const segmentEnd = findFirstSegmentEnd(pathname);
  const firstSegment = pathname.slice(1, segmentEnd);
  if (!KNOWN_PUBLIC_APP_LOCALE_BY_RAW.has(firstSegment)) return pathname;

  return buildTailFromSegmentEnd(pathname, segmentEnd);
};
