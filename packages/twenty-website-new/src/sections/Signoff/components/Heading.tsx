import { styled } from '@linaria/react';

import { Heading as BaseHeading } from '@/design-system/components';
import type { HeadingType } from '@/design-system/components/Heading';
import type { Page } from '@/lib/pages';
import { theme } from '@/theme';

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
  page?: Page;
  segments: HeadingType[];
};

export function Heading({ page, segments }: HeadingProps) {
  return (
    <HeadingWrap data-page={page}>
      <BaseHeading as="h2" segments={segments} size="xl" weight="light" />
    </HeadingWrap>
  );
}
