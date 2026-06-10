import { css } from '@linaria/core';
import { type ReactNode } from 'react';

import {
  fluidFontSize,
  FONT_WEIGHT,
  fontFamily,
  type FontWeightToken,
  semanticColor,
} from '@/tokens';

const bodyClassName = css`
  font-family: ${fontFamily('sans')};
  margin: 0;

  &[data-weight='light'] {
    font-weight: ${FONT_WEIGHT.light};
  }

  &[data-weight='regular'] {
    font-weight: ${FONT_WEIGHT.regular};
  }

  &[data-weight='medium'] {
    font-weight: ${FONT_WEIGHT.medium};
  }

  &[data-size='md'] {
    font-size: ${fluidFontSize(4, 4.5)};
    line-height: 1.55;
  }

  &[data-size='sm'] {
    font-size: ${fluidFontSize(4, 4)};
    line-height: 1.55;
  }

  &[data-size='xs'] {
    font-size: ${fluidFontSize(3, 3)};
    line-height: 1.55;
  }

  &[data-muted] {
    color: ${semanticColor.inkMuted};
  }
`;

export type BodyElement = 'p' | 'span' | 'div';
export type BodySize = 'md' | 'sm' | 'xs';

export type BodyProps = {
  as?: BodyElement;
  children: ReactNode;
  muted?: boolean;
  size?: BodySize;
  weight?: FontWeightToken;
};

export function Body({
  as: Tag = 'p',
  children,
  muted = false,
  size = 'md',
  weight = 'regular',
}: BodyProps) {
  return (
    <Tag
      className={bodyClassName}
      data-muted={muted ? '' : undefined}
      data-size={size}
      data-weight={weight}
    >
      {children}
    </Tag>
  );
}
