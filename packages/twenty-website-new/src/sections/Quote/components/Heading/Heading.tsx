import { Heading as BaseHeading } from '@/design-system/components/Heading/Heading';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const HeadingWrapper = styled.div`
  color: ${theme.colors.secondary.text[100]};
  max-width: 100%;
  min-width: 0;
  white-space: pre-line;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 517px;
  }
`;

type QuoteHeadingProps = {
  segments: HeadingType[];
};

export function Heading({ segments }: QuoteHeadingProps) {
  return (
    <HeadingWrapper>
      <BaseHeading as="h2" segments={segments} size="xl" weight="light" />
    </HeadingWrapper>
  );
}
