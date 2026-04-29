import type { StreamingSegment } from './streaming-text-types';

export const getStreamingSegmentLength = (segment: StreamingSegment): number =>
  segment.kind === 'text' ? segment.value.length : (segment.length ?? 1);
