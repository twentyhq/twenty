import {
  Body as BaseBody,
  type BodyAs,
  type BodyFamily,
  type BodySize,
  type BodyVariant,
  type BodyWeight,
} from '@/design-system/components/Body';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledBody = styled.div<{ $maxWidthMd: number }>`
  color: var(--color-text-muted, ${theme.colors.primary.text[60]});

  &[data-preserve-line-breaks='true'] {
    white-space: pre-line;
  }

  margin-top: calc(${theme.spacing(2)} - ${theme.spacing(6)});
  max-width: 360px;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: ${({ $maxWidthMd }) => `${$maxWidthMd}px`};
  }
`;

type HeroBodyProps = {
  as?: BodyAs;
  children: ReactNode;
  family?: BodyFamily;
  // The body column width at md and up (mobile is always 360px). Each hero
  // owns its own measure rather than the section switching on a page id.
  maxWidthMd: number;
  preserveLineBreaks?: boolean;
  size?: BodySize;
  variant?: BodyVariant;
  weight?: BodyWeight;
};

// Shared hero sub-heading copy block.
export function HeroBody({
  as,
  children,
  family,
  maxWidthMd,
  preserveLineBreaks = false,
  size,
  variant,
  weight,
}: HeroBodyProps) {
  return (
    <StyledBody
      $maxWidthMd={maxWidthMd}
      data-preserve-line-breaks={preserveLineBreaks}
    >
      <BaseBody
        as={as}
        family={family}
        size={size}
        variant={variant}
        weight={weight}
      >
        {children}
      </BaseBody>
    </StyledBody>
  );
}
