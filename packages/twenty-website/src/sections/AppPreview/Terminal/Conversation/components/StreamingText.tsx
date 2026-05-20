'use client';

import { styled } from '@linaria/react';

import { renderStreamingSegments } from './RenderStreamingSegments';
import type { StreamingSegment } from '../types/streaming-text-types';
import { useStreamingTextProgress } from '../hooks/use-streaming-text-progress';

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

export const StreamingText = ({
  segments,
  charDurationMs = 14,
  instant = false,
  onComplete,
}: StreamingTextProps) => {
  const { isComplete, revealed } = useStreamingTextProgress({
    charDurationMs,
    instant,
    onComplete,
    segments,
  });

  return (
    <StreamWrap>
      {renderStreamingSegments(segments, revealed)}
      {!isComplete && <Caret />}
    </StreamWrap>
  );
};
