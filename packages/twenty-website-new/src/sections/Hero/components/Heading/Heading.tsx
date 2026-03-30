import {
  Heading as BaseHeading,
  type HeadingProps,
} from '@/design-system/components/Heading/Heading';
import { Pages } from '@/enums/pages';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

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

export type HeroHeadingProps = HeadingProps & { page: Pages };

export function Heading({
  page,
  size = 'lg',
  weight = 'light',
  ...props
}: HeroHeadingProps) {
  return (
    <HeadingContainer data-page={page}>
      <BaseHeading size={size} weight={weight} {...props} />
    </HeadingContainer>
  );
}
