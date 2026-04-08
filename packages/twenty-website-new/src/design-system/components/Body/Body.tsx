import { theme } from '@/theme';
import { css } from '@linaria/core';
import { BodyType } from './types/Body';

const bodyClassName = css`
  margin: 0;
  letter-spacing: -0.01em;

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
    line-height: ${theme.lineHeight(5.5)};
  }

  &[data-size='sm'] {
    font-size: ${theme.font.size(4)};
    line-height: ${theme.lineHeight(5.5)};
  }

  &[data-size='xs'] {
    font-size: ${theme.font.size(3)};
    line-height: ${theme.lineHeight(3.5)};
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    &[data-size='md'] {
      font-size: ${theme.font.size(4.5)};
      line-height: ${theme.lineHeight(6)};
    }

    &[data-size='sm'] {
      font-size: ${theme.font.size(4)};
      line-height: ${theme.lineHeight(5.5)};
    }

    &[data-size='xs'] {
      font-size: ${theme.font.size(3)};
      line-height: ${theme.lineHeight(3.5)};
    }
  }
`;

export type BodyAs = 'p' | 'span' | 'div';
export type BodyFamily = 'sans' | 'serif' | 'mono';
export type BodyWeight = 'light' | 'regular' | 'medium';
export type BodySize = 'md' | 'sm' | 'xs';

export type BodyProps = {
  as?: BodyAs;
  body: BodyType;
  family?: BodyFamily;
  weight?: BodyWeight;
  size?: BodySize;
  className?: string;
};

export function Body({
  as: Tag = 'p',
  body,
  family = 'sans',
  weight = 'regular',
  size = 'md',
  className,
}: BodyProps) {
  const rootClassName = [bodyClassName, className].filter(Boolean).join(' ');

  return (
    <Tag
      className={rootClassName}
      data-family={family}
      data-weight={weight}
      data-size={size}
    >
      {body.text}
    </Tag>
  );
}
