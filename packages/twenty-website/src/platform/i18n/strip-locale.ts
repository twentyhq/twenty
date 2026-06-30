import { hrefSegments } from './href-segments';
import { isWebsiteLocale } from './is-website-locale';

export const stripLocale = (pathname: string): string => {
  if (!pathname.startsWith('/')) return pathname;

  const segmentEnd = hrefSegments.findFirstSegmentEnd(pathname);
  const firstSegment = pathname.slice(1, segmentEnd);
  if (!isWebsiteLocale(firstSegment)) return pathname;

  return hrefSegments.buildTailFromSegmentEnd(pathname, segmentEnd);
};
