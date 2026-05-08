import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

export type MarqueeSegment = {
  fontFamily: string;
  text: ReactNode;
};

const MARQUEE_REPEAT = 6;

const StyledSection = styled.section`
  min-width: 0;
  overflow: clip;
  padding-bottom: ${theme.spacing(20)};
  padding-top: ${theme.spacing(20)};
  width: 100%;

  &[data-scheme='light'] {
    background-color: var(--color-white);
    color: var(--color-text);
  }

  &[data-scheme='muted'] {
    background-color: var(--color-neutral);
    color: var(--color-text);
  }

  &[data-scheme='dark'] {
    background-color: var(--color-black);
    color: var(--color-text);
  }
`;

const Viewport = styled.div`
  display: flex;
  flex-direction: column;
  height: 280px;
  overflow: hidden;
  width: 100%;
`;

const Row = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
  width: 100%;
`;

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

const PhraseGroup = styled.div`
  align-items: center;
  column-gap: ${theme.spacing(3)};
  display: flex;
  flex-shrink: 0;
`;

const Segment = styled.span`
  flex-shrink: 0;
  font-weight: ${theme.font.weight.light};
  line-height: 1;
  white-space: nowrap;

  &[data-segment-index='0'] {
    color: inherit;
    font-family: ${theme.font.family.serif};
    font-size: clamp(3rem, 9.6vw, 8.625rem);
    text-transform: uppercase;
  }

  &[data-segment-index='1'] {
    color: inherit;
    font-family: ${theme.font.family.sans};
    font-size: clamp(1.5rem, 4.9vw, 4.4375rem);
    text-transform: lowercase;
  }

  &[data-segment-index='2'] {
    color: ${theme.colors.highlight[100]};
    font-family: ${theme.font.family.sans};
    font-size: clamp(3rem, 9.6vw, 8.625rem);
    text-transform: uppercase;
  }
`;

type Scheme = 'light' | 'muted' | 'dark';

function Phrase({ segments }: { segments: MarqueeSegment[] }) {
  return (
    <PhraseGroup>
      {segments.map((segment, segmentIndex) => (
        <Segment key={segmentIndex} data-segment-index={segmentIndex}>
          {segment.text}
        </Segment>
      ))}
    </PhraseGroup>
  );
}

function Track({
  segments,
  reversed,
}: {
  segments: MarqueeSegment[];
  reversed: boolean;
}) {
  const phrases = Array.from({ length: MARQUEE_REPEAT }, (_, index) => (
    <Phrase key={index} segments={segments} />
  ));

  return (
    <AnimatedTrack data-reversed={reversed ? '' : undefined}>
      <TrackHalf>{phrases}</TrackHalf>
      <TrackHalf aria-hidden>{phrases}</TrackHalf>
    </AnimatedTrack>
  );
}

type RootProps = {
  backgroundColor?: string;
  color?: string;
  segments: MarqueeSegment[];
  scheme?: Scheme;
};

function Root({ backgroundColor, color, segments, scheme }: RootProps) {
  return (
    <StyledSection
      data-scheme={scheme}
      style={scheme ? undefined : { backgroundColor, color }}
    >
      <Viewport>
        <Row>
          <Track segments={segments} reversed={false} />
        </Row>
        <Row>
          <Track segments={segments} reversed />
        </Row>
      </Viewport>
    </StyledSection>
  );
}

export const Marquee = { Root };
