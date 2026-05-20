import { useEffect, useRef, useState } from 'react';

import { useLatestRef, useTimeoutRegistry } from '@/lib/react';

import { getStreamingSegmentLength } from '../utils/get-streaming-segment-length';
import type { StreamingSegment } from '../types/streaming-text-types';

type UseStreamingTextProgressOptions = {
  charDurationMs: number;
  instant: boolean;
  onComplete?: () => void;
  segments: ReadonlyArray<StreamingSegment>;
};

type UseStreamingTextProgressResult = {
  isComplete: boolean;
  revealed: number;
  totalLength: number;
};

const getTotalLength = (segments: ReadonlyArray<StreamingSegment>): number =>
  segments.reduce(
    (total, segment) => total + getStreamingSegmentLength(segment),
    0,
  );

export const useStreamingTextProgress = ({
  charDurationMs,
  instant,
  onComplete,
  segments,
}: UseStreamingTextProgressOptions): UseStreamingTextProgressResult => {
  const totalLength = getTotalLength(segments);
  const [revealed, setRevealed] = useState(0);
  const timeoutRegistry = useTimeoutRegistry();
  const onCompleteRef = useLatestRef(onComplete);
  const completedRef = useRef(false);
  const firedSegmentCountRef = useRef(0);

  useEffect(() => {
    setRevealed(0);
    completedRef.current = false;
    firedSegmentCountRef.current = 0;
  }, [segments]);

  useEffect(() => {
    if (!instant) {
      return;
    }
    setRevealed(totalLength);
  }, [instant, totalLength]);

  useEffect(() => {
    if (revealed >= totalLength) {
      if (!completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
      }
      return undefined;
    }

    if (instant) {
      return undefined;
    }

    return timeoutRegistry.schedule(() => {
      setRevealed((previous) => Math.min(previous + 1, totalLength));
    }, charDurationMs);
  }, [
    charDurationMs,
    instant,
    onCompleteRef,
    revealed,
    timeoutRegistry,
    totalLength,
  ]);

  useEffect(() => {
    let offset = 0;

    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];

      offset += getStreamingSegmentLength(segment);

      if (revealed < offset) {
        break;
      }

      if (index < firedSegmentCountRef.current) {
        continue;
      }

      segment.onReveal?.();
      firedSegmentCountRef.current = index + 1;
    }
  }, [revealed, segments]);

  return {
    isComplete: revealed >= totalLength,
    revealed,
    totalLength,
  };
};
