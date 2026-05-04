import { Heading as BaseHeading } from '@/design-system/components';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import type { ReactNode } from 'react';

const faqHeadingClassName = css`
  white-space: pre-line;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 700px;
  }
`;

type HeadingProps = {
  children: ReactNode;
};

export function Heading({ children }: HeadingProps) {
  return (
    <BaseHeading
      as="h2"
      className={faqHeadingClassName}
      size="lg"
      weight="light"
    >
      {children}
    </BaseHeading>
  );
}
