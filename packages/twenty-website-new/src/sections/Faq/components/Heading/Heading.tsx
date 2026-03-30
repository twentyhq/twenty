import { Heading as BaseHeading } from '@/design-system/components';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { theme } from '@/theme';
import { css } from '@linaria/core';

const faqHeadingClassName = css`
  white-space: pre-line;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 700px;
  }
`;

type HeadingProps = {
  segments: HeadingType[];
};

export function Heading({ segments }: HeadingProps) {
  return (
    <BaseHeading
      as="h2"
      className={faqHeadingClassName}
      segments={segments}
      size="lg"
      weight="light"
    />
  );
}
