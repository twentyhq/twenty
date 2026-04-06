import { styled } from '@linaria/react';

import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { theme } from '@/theme';

const PhraseGroup = styled.div`
  align-items: center;
  column-gap: ${theme.spacing(3)};
  display: flex;
  flex-shrink: 0;

  &:hover > span {
    opacity: 0.2;
    transform: scale(0.95);
  }
`;

const Segment = styled.span`
  flex-shrink: 0;
  font-weight: ${theme.font.weight.light};
  line-height: 1;
  white-space: nowrap;
  transition:
    opacity 0.4s ease,
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    color 0.4s ease;

  &:hover {
    opacity: 1 !important;
    transform: scale(1) !important;
    color: ${theme.colors.highlight[100]} !important;
  }

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

type PhraseProps = {
  segments: HeadingType[];
};

export function Phrase({ segments }: PhraseProps) {
  return (
    <PhraseGroup>
      {segments.map((segment, segmentIndex) => (
        <Segment
          key={`${segment.text}-${segmentIndex}`}
          data-segment-index={segmentIndex}
        >
          {segment.text}
        </Segment>
      ))}
    </PhraseGroup>
  );
}
