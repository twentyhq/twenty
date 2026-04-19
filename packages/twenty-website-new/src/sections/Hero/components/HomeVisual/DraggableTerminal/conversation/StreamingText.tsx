'use client';

import { styled } from '@linaria/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

type StreamingSegment =
  | { kind: 'text'; value: string; onReveal?: () => void }
  | {
      kind: 'node';
      value: ReactNode;
      length?: number;
      onReveal?: () => void;
    };

type StreamingTextProps = {
  segments: ReadonlyArray<StreamingSegment>;
  charDurationMs?: number;
  instant?: boolean;
  onComplete?: () => void;
};

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

// Reveals a mixed sequence of plain text + JSX nodes character-by-character.
// Each node occupies `length` characters in the animation (default 1) so the
// pacing stays uniform even when inline pills / links are sprinkled in.
export const StreamingText = ({
  segments,
  charDurationMs = 14,
  instant = false,
  onComplete,
}: StreamingTextProps) => {
  const totalLength = segments.reduce(
    (acc, segment) =>
      acc +
      (segment.kind === 'text' ? segment.value.length : (segment.length ?? 1)),
    0,
  );

  const [revealed, setRevealed] = useState(0);
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);
  const firedSegmentCountRef = useRef(0);

  onCompleteRef.current = onComplete;

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
    const id = window.setTimeout(() => {
      setRevealed((previous) => Math.min(previous + 1, totalLength));
    }, charDurationMs);
    return () => window.clearTimeout(id);
  }, [charDurationMs, instant, revealed, totalLength]);

  // Fire per-segment `onReveal` callbacks exactly once as each segment becomes
  // fully revealed by the streamer. Walking segments in order on every
  // `revealed` tick is cheap (paragraphs are short) and keeps firing order
  // deterministic.
  useEffect(() => {
    let offset = 0;
    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      const cost =
        segment.kind === 'text' ? segment.value.length : (segment.length ?? 1);
      offset += cost;
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
    } else {
      const cost = segment.length ?? 1;
      if (remaining < cost) {
        break;
      }
      rendered.push(<span key={`s-${index}`}>{segment.value}</span>);
      remaining -= cost;
    }
  }

  const isComplete = revealed >= totalLength;

  return (
    <StreamWrap>
      {rendered}
      {!isComplete && <Caret />}
    </StreamWrap>
  );
};

export type { StreamingSegment };
