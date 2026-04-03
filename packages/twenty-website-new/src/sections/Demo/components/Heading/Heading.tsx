import { Heading as BaseHeading } from '@/design-system/components';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const StyledHeading = styled(BaseHeading)`
  max-width: 360px;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-4px);
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 672px;
  }
`;

type HeadingProps = {
  segments: HeadingType[];
};

export function Heading({ segments }: HeadingProps) {
  return <StyledHeading segments={segments} size="lg" weight="light" />;
}
