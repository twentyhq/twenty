import { styled } from '@linaria/react';

import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { theme } from '@/theme';

import { Phrase } from '../Phrase/Phrase';

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
  heading: HeadingType[];
  reversed: boolean;
};

export function Track({ heading, reversed }: TrackProps) {
  const phrases = Array.from({ length: MARQUEE_REPEAT }, (_, index) => (
    <Phrase key={index} segments={heading} />
  ));

  return (
    <AnimatedTrack data-reversed={reversed ? '' : undefined}>
      <TrackHalf>{phrases}</TrackHalf>
      <TrackHalf aria-hidden>{phrases}</TrackHalf>
    </AnimatedTrack>
  );
}
