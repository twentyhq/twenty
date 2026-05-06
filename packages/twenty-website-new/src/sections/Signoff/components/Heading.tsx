import { styled } from '@linaria/react';

import { Heading as BaseHeading } from '@/design-system/components';
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
  children: ReactNode;
  page?: Page;
};

export function Heading({ children, page }: HeadingProps) {
  return (
    <HeadingWrap data-page={page}>
      <BaseHeading as="h2" size="xl" weight="light">
        {children}
      </BaseHeading>
    </HeadingWrap>
  );
}
