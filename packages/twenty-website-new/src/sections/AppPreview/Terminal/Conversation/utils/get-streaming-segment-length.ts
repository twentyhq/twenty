import type { StreamingSegment } from '../types/streaming-text-types';

export const getStreamingSegmentLength = (segment: StreamingSegment): number =>
  segment.kind === 'text' ? segment.value.length : (segment.length ?? 1);
