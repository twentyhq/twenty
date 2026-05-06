import { Heading as BaseHeading } from '@/design-system/components';
import type { HeadingSize } from '@/design-system/components/Heading';
import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';
import { theme } from '@/theme';
import type { MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledHeading = styled(BaseHeading)`
  white-space: pre-line;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 668px;
  }
`;

type HeadingProps = {
  segments: MessageHeadingSegment;
  renderText: (descriptor: MessageDescriptor) => ReactNode;
  size?: HeadingSize;
};

export function Heading({ segments, renderText, size = 'sm' }: HeadingProps) {
  return (
    <StyledHeading
      renderText={renderText}
      segments={segments}
      size={size}
      weight="light"
    />
  );
}
