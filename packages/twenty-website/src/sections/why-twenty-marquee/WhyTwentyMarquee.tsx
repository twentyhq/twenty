import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  color,
  fontFamily,
  FONT_WEIGHT,
  REDUCED_MOTION,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { SectionShell } from '@/ui';

const MARQUEE_REPEAT = 6;

type MarqueeSegment = {
  accent: boolean;
  family: 'sans' | 'serif';
  id: string;
  label: MessageDescriptor;
  tier: 'lg' | 'sm';
  transform: 'lowercase' | 'uppercase';
};

// Two stepped tiers — the loud rows (display, 120px) and the quieter
// 'same output' (headingLg, 60px); family and the accent colour carry the rest.
const MARQUEE_SEGMENTS: readonly MarqueeSegment[] = [
  {
    accent: false,
    family: 'serif',
    id: 'crm',
    label: msg`Same CRM`,
    tier: 'lg',
    transform: 'uppercase',
  },
  {
    accent: false,
    family: 'sans',
    id: 'output',
    label: msg`Same output`,
    tier: 'sm',
    transform: 'lowercase',
  },
  {
    accent: true,
    family: 'sans',
    id: 'results',
    label: msg`Same results`,
    tier: 'lg',
    transform: 'uppercase',
  },
];

const REPEAT_ORDINALS = Array.from(
  { length: MARQUEE_REPEAT },
  (_, index) => index,
);

const Viewport = styled.div`
  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

// Clips the scrolling track to the content column (not the viewport).
const Row = styled.div`
  overflow: hidden;
  width: 100%;
`;

const Track = styled.div`
  display: flex;
  width: max-content;

  @keyframes whyTwentyMarqueeSlide {
    from {
      transform: translate3d(0, 0, 0);
    }

    to {
      transform: translate3d(-50%, 0, 0);
    }
  }

  animation: whyTwentyMarqueeSlide 55s linear infinite;

  &[data-reversed] {
    animation-direction: reverse;
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const TrackHalf = styled.div`
  column-gap: ${spacing(8)};
  display: flex;
  flex-shrink: 0;
  padding-right: ${spacing(8)};
`;

const Phrase = styled.div`
  align-items: baseline;
  column-gap: ${spacing(3)};
  display: flex;
  flex-shrink: 0;
`;

const Segment = styled.span`
  flex-shrink: 0;
  font-weight: ${FONT_WEIGHT.light};
  white-space: nowrap;

  &[data-tier='lg'] {
    ${typeRampDeclarations('display')}
  }

  &[data-tier='sm'] {
    ${typeRampDeclarations('headingLg')}
  }

  &[data-family='serif'] {
    font-family: ${fontFamily('serif')};
  }

  &[data-family='sans'] {
    font-family: ${fontFamily('sans')};
  }

  &[data-transform='uppercase'] {
    text-transform: uppercase;
  }

  &[data-transform='lowercase'] {
    text-transform: lowercase;
  }

  &[data-accent] {
    color: ${color('blue')};
  }
`;

export function WhyTwentyMarquee() {
  const i18n = getServerI18n();

  const renderHalf = () => (
    <TrackHalf>
      {REPEAT_ORDINALS.map((ordinal) => (
        <Phrase key={ordinal}>
          {MARQUEE_SEGMENTS.map((segment) => (
            <Segment
              data-accent={segment.accent ? '' : undefined}
              data-family={segment.family}
              data-tier={segment.tier}
              data-transform={segment.transform}
              key={segment.id}
            >
              {i18n._(segment.label)}
            </Segment>
          ))}
        </Phrase>
      ))}
    </TrackHalf>
  );

  const renderTrack = (reversed: boolean) => (
    <Track data-reversed={reversed ? '' : undefined}>
      {renderHalf()}
      {renderHalf()}
    </Track>
  );

  // Decorative restatement of the editorials' argument — hidden from the
  // accessibility tree (the prose above carries it).
  return (
    <SectionShell flushInline keepsTopRhythm rhythm="spacious" scheme="dark">
      <Viewport aria-hidden>
        <Row>{renderTrack(false)}</Row>
        <Row>{renderTrack(true)}</Row>
      </Viewport>
    </SectionShell>
  );
}
