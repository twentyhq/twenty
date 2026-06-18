import { LOCALE_BY_URL_SEGMENT } from './locale-by-url-segment';

export const hrefSegments: {
  findFirstSegmentEnd: (path: string) => number;
  buildTailFromSegmentEnd: (path: string, segmentEnd: number) => string;
  isLocalePrefixSegment: (segment: string) => boolean;
} = {
  findFirstSegmentEnd: (path) => {
    for (let i = 1; i < path.length; i += 1) {
      const ch = path[i];
      if (ch === '/' || ch === '?' || ch === '#') return i;
    }
    return path.length;
  },
  buildTailFromSegmentEnd: (path, segmentEnd) => {
    const tail = path.slice(segmentEnd);
    if (tail.length === 0) return '/';
    if (tail.startsWith('?') || tail.startsWith('#')) return `/${tail}`;
    return tail;
  },
  isLocalePrefixSegment: (segment) => LOCALE_BY_URL_SEGMENT.has(segment),
};
