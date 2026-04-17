import { Heading as BaseHeading } from '@/design-system/components';
import type { HeadingSize } from '@/design-system/components/Heading/Heading';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const StyledHeading = styled(BaseHeading)`
  white-space: pre-line;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 668px;
  }
`;

type HeadingProps = {
  segments: HeadingType;
  size?: HeadingSize;
};

export function Heading({ segments, size = 'sm' }: HeadingProps) {
  return <StyledHeading segments={segments} size={size} weight="light" />;
}
