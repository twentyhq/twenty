import { Heading as BaseHeading } from '@/design-system/components';
import type { HeadingSize } from '@/design-system/components/Heading';
import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';
import { renderMessageDescriptor } from '@/lib/i18n/render-message-descriptor';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const StyledHeading = styled(BaseHeading)`
  white-space: pre-line;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 668px;
  }
`;

type HeadingProps = {
  segments: MessageHeadingSegment;
  size?: HeadingSize;
};

export function Heading({ segments, size = 'sm' }: HeadingProps) {
  return (
    <StyledHeading
      renderText={renderMessageDescriptor}
      segments={segments}
      size={size}
      weight="light"
    />
  );
}
