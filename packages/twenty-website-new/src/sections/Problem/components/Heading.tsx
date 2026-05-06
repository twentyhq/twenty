import {
  Heading as BaseHeading,
  type HeadingProps,
} from '@/design-system/components/Heading';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import type { ReactNode } from 'react';

const problemHeadingClassName = css`
  margin-top: calc(${theme.spacing(2)} - ${theme.spacing(10)});

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-top: calc(${theme.spacing(2)} - ${theme.spacing(16)});
  }
`;

export function Heading({
  as = 'h2',
  children,
  className,
  size = 'md',
  weight = 'light',
}: HeadingProps & {
  children?: ReactNode;
}) {
  return (
    <BaseHeading
      as={as}
      className={[problemHeadingClassName, className].filter(Boolean).join(' ')}
      size={size}
      weight={weight}
    >
      {children}
    </BaseHeading>
  );
}
