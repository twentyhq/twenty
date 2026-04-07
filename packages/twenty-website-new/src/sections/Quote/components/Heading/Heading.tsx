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
  position: relative;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);

  /* Apple-style floating quote marks on hover */
  &::before {
    content: '"';
    position: absolute;
    left: -32px;
    top: -16px;
    font-size: 64px;
    color: ${theme.colors.secondary.border[20]};
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.4s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    font-family: ${theme.font.family.serif};
  }

  &:hover {
    transform: translateX(12px);
  }

  &:hover::before {
    opacity: 1;
    transform: translateY(0);
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 517px;

    &::before {
      left: -48px;
      top: -24px;
      font-size: 96px;
    }
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
