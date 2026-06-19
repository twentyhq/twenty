import { hrefSegments } from './href-segments';

export const stripLocale = (pathname: string): string => {
  if (!pathname.startsWith('/')) return pathname;

  const segmentEnd = hrefSegments.findFirstSegmentEnd(pathname);
  const firstSegment = pathname.slice(1, segmentEnd);
  if (!hrefSegments.isLocalePrefixSegment(firstSegment)) return pathname;

  return hrefSegments.buildTailFromSegmentEnd(pathname, segmentEnd);
};
