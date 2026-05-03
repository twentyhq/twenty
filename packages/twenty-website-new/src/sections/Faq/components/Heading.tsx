import { Heading as BaseHeading } from '@/design-system/components';
import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';
import { renderMessageDescriptor } from '@/lib/i18n/render-message-descriptor';
import { theme } from '@/theme';
import { css } from '@linaria/core';

const faqHeadingClassName = css`
  white-space: pre-line;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 700px;
  }
`;

type HeadingProps = {
  segments: MessageHeadingSegment[];
};

export function Heading({ segments }: HeadingProps) {
  return (
    <BaseHeading
      as="h2"
      className={faqHeadingClassName}
      renderText={renderMessageDescriptor}
      segments={segments}
      size="lg"
      weight="light"
    />
  );
}
