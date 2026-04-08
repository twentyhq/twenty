import { Heading as BaseHeading } from '@/design-system/components';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const StyledHeading = styled(BaseHeading)`
  white-space: pre-line;
  position: relative;
  display: inline-block;

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
