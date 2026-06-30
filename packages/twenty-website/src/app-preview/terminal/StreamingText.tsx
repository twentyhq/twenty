'use client';

import { styled } from '@linaria/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { useTimeoutRegistry } from '../stage/use-timeout-registry';

// Character-by-character reveal over mixed segments: plain text streams
// per character; node segments (chips, file links) pop in atomically and
// can fire onReveal — the scenario's object-creation trigger.
export type StreamingSegment =
  | { kind: 'text'; value: string; onReveal?: () => void }
  | { kind: 'node'; value: ReactNode; length?: number; onReveal?: () => void };

const getSegmentLength = (segment: StreamingSegment): number =>
  segment.kind === 'text' ? segment.value.length : (segment.length ?? 1);

function renderSegments(
  segments: ReadonlyArray<StreamingSegment>,
  revealed: number,
): ReactNode[] {
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
    const cost = getSegmentLength(segment);
    if (remaining < cost) {
      break;
    }
    rendered.push(<span key={`s-${index}`}>{segment.value}</span>);
    remaining -= cost;
  }
  return rendered;
}

const StreamWrap = styled.span`
  display: inline;
`;

const Caret = styled.span`
  animation: chatCaretBlink 1s steps(1, end) infinite;
  background: currentColor;
  display: inline-block;
  height: 1em;
  margin-left: 2px;
  opacity: 0.55;
  vertical-align: text-bottom;
  width: 1.5px;

  @keyframes chatCaretBlink {
    0%,
    50% {
      opacity: 0.55;
    }
    51%,
    100% {
      opacity: 0;
    }
  }
`;

export function StreamingText({
  segments,
  charDurationMs = 14,
  instant = false,
  onComplete,
}: {
  segments: ReadonlyArray<StreamingSegment>;
  charDurationMs?: number;
  instant?: boolean;
  onComplete?: () => void;
}) {
  const totalLength = segments.reduce(
    (total, segment) => total + getSegmentLength(segment),
    0,
  );
  const [revealed, setRevealed] = useState(0);
  const timeoutRegistry = useTimeoutRegistry();
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
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
  }, [charDurationMs, instant, revealed, timeoutRegistry, totalLength]);

  // Fire each segment's onReveal exactly once, in stream order.
  useEffect(() => {
    let offset = 0;
    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      offset += getSegmentLength(segment);
      if (revealed < offset) {
        break;
      }
      if (index < firedSegmentCountRef.current) {
        continue;
      }
      firedSegmentCountRef.current = index + 1;
      segment.onReveal?.();
    }
  }, [revealed, segments]);

  const isComplete = revealed >= totalLength;

  return (
    <StreamWrap>
      {renderSegments(segments, revealed)}
      {!isComplete && <Caret />}
    </StreamWrap>
  );
}
