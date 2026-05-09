import { Heading as BaseHeading } from '@/design-system/components';
import type { HeadingSize } from '@/design-system/components/Heading';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledHeading = styled(BaseHeading)`
  white-space: pre-line;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 668px;
  }
`;

type HeadingProps = {
  children: ReactNode;
  size?: HeadingSize;
};

export function Heading({ children, size = 'sm' }: HeadingProps) {
  return (
    <StyledHeading size={size} weight="light">
      {children}
    </StyledHeading>
  );
}
