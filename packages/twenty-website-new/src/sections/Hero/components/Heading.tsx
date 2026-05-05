import {
  Heading as BaseHeading,
  type HeadingProps,
} from '@/design-system/components/Heading';
import { type Page, Pages } from '@/lib/pages';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const HeadingContainer = styled.div`
  max-width: 360px;
  width: 100%;
  word-wrap: break-word;

  &[data-page=${Pages.WhyTwenty}] {
    color: ${theme.colors.secondary.text[100]};
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 672px;
  }
`;

export type HeroHeadingProps = HeadingProps & {
  children?: ReactNode;
  page: Page;
};

export function Heading({
  as = 'h1',
  children,
  className,
  page,
  size = 'lg',
  weight = 'light',
}: HeroHeadingProps) {
  return (
    <HeadingContainer data-page={page}>
      <BaseHeading as={as} className={className} size={size} weight={weight}>
        {children}
      </BaseHeading>
    </HeadingContainer>
  );
}
