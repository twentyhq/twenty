import { Heading as BaseHeading } from '@/design-system/components/Heading/Heading';
import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

const statementHeadingClassName = css`
  text-align: center;

  &[data-size='xl'] {
    line-height: ${theme.lineHeight(19)};
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    &[data-size='xl'] {
      line-height: ${theme.lineHeight(19)};
    }
  }
`;

const HeadingWrapper = styled.div`
  margin-left: auto;
  margin-right: auto;
  max-width: 901px;
  min-width: 0;
  width: 100%;
`;

type StatementHeadingProps = {
  segments: HeadingType | HeadingType[];
};

export function Heading({ segments }: StatementHeadingProps) {
  return (
    <HeadingWrapper>
      <BaseHeading
        as="h2"
        className={statementHeadingClassName}
        segments={segments}
        size="xl"
        weight="light"
      />
    </HeadingWrapper>
  );
}
