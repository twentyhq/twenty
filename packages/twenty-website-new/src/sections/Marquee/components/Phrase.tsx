import { styled } from '@linaria/react';

import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';
import { theme } from '@/theme';
import type { MessageDescriptor } from '@lingui/core';

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

type PhraseProps = {
  renderText: (descriptor: MessageDescriptor) => string;
  segments: MessageHeadingSegment[];
};

export function Phrase({ renderText, segments }: PhraseProps) {
  return (
    <PhraseGroup>
      {segments.map((segment, segmentIndex) => (
        <Segment key={segmentIndex} data-segment-index={segmentIndex}>
          {renderText(segment.text)}
        </Segment>
      ))}
    </PhraseGroup>
  );
}
