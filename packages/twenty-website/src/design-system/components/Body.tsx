import { theme } from '@/theme';
import { css } from '@linaria/core';
import type { ReactNode } from 'react';

const bodyClassName = css`
  color: inherit;
  margin: 0;
  letter-spacing: 0;

  &[data-family='sans'] {
    font-family: ${theme.font.family.sans};
  }

  &[data-family='serif'] {
    font-family: ${theme.font.family.serif};
  }

  &[data-family='mono'] {
    font-family: ${theme.font.family.mono};
    letter-spacing: -0.02em;
  }

  &[data-weight='light'] {
    font-weight: ${theme.font.weight.light};
  }

  &[data-weight='regular'] {
    font-weight: ${theme.font.weight.regular};
  }

  &[data-weight='medium'] {
    font-weight: ${theme.font.weight.medium};
  }

  &[data-size='md'] {
    font-size: ${theme.font.size(4)};
    line-height: 1.55;
  }

  &[data-size='sm'] {
    color: var(--color-text-muted, ${theme.colors.primary.text[60]});
    font-size: ${theme.font.size(4)};
    line-height: 1.55;
  }

  &[data-size='xs'] {
    font-size: ${theme.font.size(3)};
    line-height: 1.55;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    &[data-size='md'] {
      font-size: ${theme.font.size(4.5)};
      line-height: 1.55;
    }

    &[data-size='sm'] {
      font-size: ${theme.font.size(4)};
      line-height: 1.55;
    }

    &[data-size='xs'] {
      font-size: ${theme.font.size(3)};
      line-height: 1.55;
    }
  }

  &[data-variant='body-paragraph'] {
    color: var(--color-text-muted, ${theme.colors.primary.text[80]});
    line-height: 1.55;
  }
`;

export type BodyAs = 'p' | 'span' | 'div';
export type BodyFamily = 'sans' | 'serif' | 'mono';
export type BodyWeight = 'light' | 'regular' | 'medium';
export type BodySize = 'md' | 'sm' | 'xs';
export type BodyVariant = 'default' | 'body-paragraph';

export type BodyProps = {
  as?: BodyAs;
  children: ReactNode;
  family?: BodyFamily;
  weight?: BodyWeight;
  size?: BodySize;
  variant?: BodyVariant;
  className?: string;
};

export function Body({
  as: Tag = 'p',
  children,
  family = 'sans',
  weight = 'regular',
  size = 'md',
  variant = 'default',
  className,
}: BodyProps) {
  const rootClassName = [bodyClassName, className].filter(Boolean).join(' ');

  return (
    <Tag
      className={rootClassName}
      data-family={family}
      data-weight={weight}
      data-size={size}
      data-variant={variant}
    >
      {children}
    </Tag>
  );
}
