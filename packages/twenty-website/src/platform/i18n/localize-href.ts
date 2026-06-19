import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import { hrefSegments } from './href-segments';
import { isWebsiteLocale } from './is-website-locale';
import { localeToUrlSegment } from './locale-to-url-segment';

export const localizeHref = (locale: AppLocale, href: string): string => {
  if (!href.startsWith('/') || href.startsWith('//')) return href;

  const segmentEnd = hrefSegments.findFirstSegmentEnd(href);
  const firstSegment = href.slice(1, segmentEnd);

  const unprefixed = hrefSegments.isLocalePrefixSegment(firstSegment)
    ? hrefSegments.buildTailFromSegmentEnd(href, segmentEnd)
    : href;

  if (locale === SOURCE_LOCALE || !isWebsiteLocale(locale)) {
    return unprefixed;
  }

  const segment = localeToUrlSegment(locale);
  return unprefixed === '/' ? `/${segment}` : `/${segment}${unprefixed}`;
};
