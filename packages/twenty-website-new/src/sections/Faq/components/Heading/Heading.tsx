import { Heading as BaseHeading } from '@/design-system/components';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

const faqHeadingClassName = css`
  white-space: pre-line;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 700px;
  }
`;

const HeadingWrapper = styled.div`
  transition:
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.4s ease;

  &:hover {
    transform: translateX(4px);
    opacity: 0.8;
  }
`;

type HeadingProps = {
  segments: HeadingType[];
};

export function Heading({ segments }: HeadingProps) {
  return (
    <HeadingWrapper>
      <BaseHeading
        as="h2"
        className={faqHeadingClassName}
        segments={segments}
        size="lg"
        weight="light"
      />
    </HeadingWrapper>
  );
}
