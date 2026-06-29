import {
  DOCUMENTATION_DEFAULT_LANGUAGE,
  type DocumentationSupportedLanguage,
} from 'twenty-shared/constants';

import { hrefSegments } from './href-segments';
import { isWebsiteLocale } from './is-website-locale';

export const localizeHref = (
  locale: DocumentationSupportedLanguage,
  href: string,
): string => {
  if (!href.startsWith('/') || href.startsWith('//')) return href;

  const segmentEnd = hrefSegments.findFirstSegmentEnd(href);
  const firstSegment = href.slice(1, segmentEnd);

  const unprefixed = isWebsiteLocale(firstSegment)
    ? hrefSegments.buildTailFromSegmentEnd(href, segmentEnd)
    : href;

  if (locale === DOCUMENTATION_DEFAULT_LANGUAGE) {
    return unprefixed;
  }

  return unprefixed === '/' ? `/${locale}` : `/${locale}${unprefixed}`;
};
