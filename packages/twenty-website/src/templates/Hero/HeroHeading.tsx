import {
  Heading as BaseHeading,
  type HeadingProps,
} from '@/design-system/components/Heading';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const HeadingContainer = styled.div`
  max-width: 360px;
  width: 100%;
  word-wrap: break-word;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 672px;
  }
`;

type HeroHeadingProps = HeadingProps & { children?: ReactNode };

export function HeroHeading({
  as = 'h1',
  children,
  className,
  size = 'lg',
  weight = 'light',
}: HeroHeadingProps) {
  return (
    <HeadingContainer className={className}>
      <BaseHeading as={as} size={size} weight={weight}>
        {children}
      </BaseHeading>
    </HeadingContainer>
  );
}
