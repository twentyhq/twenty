import type { ReactNode } from 'react';

import { getStreamingSegmentLength } from '../utils/get-streaming-segment-length';
import type { StreamingSegment } from '../types/streaming-text-types';

export const renderStreamingSegments = (
  segments: ReadonlyArray<StreamingSegment>,
  revealed: number,
): ReactNode[] => {
  const rendered: ReactNode[] = [];
  let remaining = revealed;

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];

    if (remaining <= 0) {
      break;
    }

    if (segment.kind === 'text') {
      const take = Math.min(segment.value.length, remaining);
      rendered.push(
        <span key={`s-${index}`}>{segment.value.slice(0, take)}</span>,
      );
      remaining -= take;
      continue;
    }

    const cost = getStreamingSegmentLength(segment);

    if (remaining < cost) {
      break;
    }

    rendered.push(<span key={`s-${index}`}>{segment.value}</span>);
    remaining -= cost;
  }

  return rendered;
};
