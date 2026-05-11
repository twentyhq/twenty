import {
  Body as BaseBody,
  type BodyAs,
  type BodyFamily,
  type BodySize,
  type BodyVariant,
  type BodyWeight,
} from '@/design-system/components/Body';
import type { Page } from '@/lib/pages';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledBody = styled.div`
  color: var(--color-text-muted, ${theme.colors.primary.text[60]});

  &[data-preserve-line-breaks='true'] {
    white-space: pre-line;
  }

  margin-top: calc(${theme.spacing(2)} - ${theme.spacing(6)});
  max-width: 360px;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    &[data-page='home'] {
      max-width: 591px;
    }

    &[data-page='partners'] {
      max-width: 500px;
    }

    &[data-page='pricing'] {
      max-width: 500px;
    }

    &[data-page='product'] {
      max-width: 591px;
    }

    &[data-page='whyTwenty'] {
      max-width: 443px;
    }

    &[data-page='releaseNotes'] {
      max-width: 591px;
      white-space: pre-line;
    }

    &[data-page='articles'] {
      max-width: 550px;
    }

    &[data-page='caseStudies'] {
      max-width: 550px;
    }
  }
`;

type HeroBodyProps = {
  as?: BodyAs;
  children: ReactNode;
  className?: string;
  family?: BodyFamily;
  page: Page;
  preserveLineBreaks?: boolean;
  size?: BodySize;
  variant?: BodyVariant;
  weight?: BodyWeight;
};

export function Body({
  as,
  children,
  className,
  family,
  page,
  preserveLineBreaks = false,
  size,
  variant,
  weight,
}: HeroBodyProps) {
  return (
    <StyledBody data-page={page} data-preserve-line-breaks={preserveLineBreaks}>
      <BaseBody
        as={as}
        className={className}
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
