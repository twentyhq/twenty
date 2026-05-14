import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import { isPublicAppLocale } from './app-locale-set';
import {
  LOCALE_BY_URL_SEGMENT,
  localeToUrlSegment,
} from './website-locale-segments';

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

const isLocalePrefixSegment = (segment: string): boolean =>
  LOCALE_BY_URL_SEGMENT.has(segment);

export const localizeHref = (locale: AppLocale, href: string): string => {
  if (!href.startsWith('/') || href.startsWith('//')) return href;

  const segmentEnd = findFirstSegmentEnd(href);
  const firstSegment = href.slice(1, segmentEnd);

  const unprefixed = isLocalePrefixSegment(firstSegment)
    ? buildTailFromSegmentEnd(href, segmentEnd)
    : href;

  if (locale === SOURCE_LOCALE || !isPublicAppLocale(locale)) {
    return unprefixed;
  }

  const segment = localeToUrlSegment(locale);
  return unprefixed === '/' ? `/${segment}` : `/${segment}${unprefixed}`;
};

export const stripLocale = (pathname: string): string => {
  if (!pathname.startsWith('/')) return pathname;

  const segmentEnd = findFirstSegmentEnd(pathname);
  const firstSegment = pathname.slice(1, segmentEnd);
  if (!isLocalePrefixSegment(firstSegment)) return pathname;

  return buildTailFromSegmentEnd(pathname, segmentEnd);
};
