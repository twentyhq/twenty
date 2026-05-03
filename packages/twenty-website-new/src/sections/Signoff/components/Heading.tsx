import { styled } from '@linaria/react';

import { Heading as BaseHeading } from '@/design-system/components';
import type { MessageHeadingSegment } from '@/lib/i18n/message-heading-segment';
import { renderMessageDescriptor } from '@/lib/i18n/render-message-descriptor';
import type { Page } from '@/lib/pages';
import { theme } from '@/theme';
import type { ReactNode } from 'react';

const HeadingWrap = styled.div`
  margin-bottom: ${theme.spacing(2)};
  margin-left: auto;
  margin-right: auto;
  max-width: ${theme.layout.editorial};
  min-width: 0;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    &[data-page='partners'] {
      white-space: pre-line;
    }
  }
`;

type HeadingProps = {
  children?: ReactNode;
  page?: Page;
  segments?: MessageHeadingSegment[];
};

export function Heading({ children, page, segments }: HeadingProps) {
  return (
    <HeadingWrap data-page={page}>
      <BaseHeading
        as="h2"
        renderText={renderMessageDescriptor}
        segments={segments}
        size="xl"
        weight="light"
      >
        {segments === undefined ? children : undefined}
      </BaseHeading>
    </HeadingWrap>
  );
}
