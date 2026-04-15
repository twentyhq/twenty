import { styled } from '@linaria/react';

import { Heading as BaseHeading } from '@/design-system/components';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import type { Pages } from '@/enums/pages';
import { theme } from '@/theme';

const HeadingWrap = styled.div`
  margin-bottom: ${theme.spacing(2)};
  margin-left: auto;
  margin-right: auto;
  max-width: 921px;
  min-width: 0;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    &[data-page='partner'] {
      white-space: pre-line;
    }
  }
`;

type HeadingProps = {
  page?: Pages;
  segments: HeadingType[];
};

export function Heading({ page, segments }: HeadingProps) {
  return (
    <HeadingWrap data-page={page}>
      <BaseHeading as="h2" segments={segments} size="xl" weight="light" />
    </HeadingWrap>
  );
}
