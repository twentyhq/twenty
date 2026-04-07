import {
  Heading as BaseHeading,
  type HeadingProps,
} from '@/design-system/components/Heading/Heading';
import { theme } from '@/theme';
import { css } from '@linaria/core';

const problemHeadingClassName = css`
  margin-top: calc(${theme.spacing(2)} - ${theme.spacing(10)});

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-top: calc(${theme.spacing(2)} - ${theme.spacing(16)});
  }
`;

export function Heading({
  as = 'h2',
  size = 'md',
  weight = 'light',
  ...props
}: HeadingProps) {
  return (
    <BaseHeading
      className={problemHeadingClassName}
      as={as}
      size={size}
      weight={weight}
      {...props}
    />
  );
}
