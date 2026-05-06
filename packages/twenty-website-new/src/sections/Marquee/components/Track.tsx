import { styled } from '@linaria/react';

import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';
import { theme } from '@/theme';
import type { MessageDescriptor } from '@lingui/core';

import { Phrase } from './Phrase';

const MARQUEE_REPEAT = 6;

const AnimatedTrack = styled.div`
  @keyframes marqueeMarqueeSlide {
    from {
      transform: translate3d(0, 0, 0);
    }

    to {
      transform: translate3d(-50%, 0, 0);
    }
  }

  animation: marqueeMarqueeSlide 55s linear infinite;
  display: flex;
  flex-shrink: 0;
  width: max-content;

  &[data-reversed] {
    animation-direction: reverse;
  }
`;

const TrackHalf = styled.div`
  column-gap: ${theme.spacing(6)};
  display: flex;
  flex-shrink: 0;
`;

type TrackProps = {
  heading: MessageHeadingSegment[];
  renderText: (descriptor: MessageDescriptor) => string;
  reversed: boolean;
};

export function Track({ heading, renderText, reversed }: TrackProps) {
  const phrases = Array.from({ length: MARQUEE_REPEAT }, (_, index) => (
    <Phrase key={index} renderText={renderText} segments={heading} />
  ));

  return (
    <AnimatedTrack data-reversed={reversed ? '' : undefined}>
      <TrackHalf>{phrases}</TrackHalf>
      <TrackHalf aria-hidden>{phrases}</TrackHalf>
    </AnimatedTrack>
  );
}
