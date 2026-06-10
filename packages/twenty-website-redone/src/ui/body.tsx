import { css } from '@linaria/core';
import { type ReactNode } from 'react';

import {
  FONT_WEIGHT,
  fontFamily,
  type FontWeightToken,
  semanticColor,
  typeRampDeclarations,
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
    ${typeRampDeclarations('bodyMd')}
  }

  &[data-size='sm'] {
    ${typeRampDeclarations('bodySm')}
  }

  &[data-size='xs'] {
    ${typeRampDeclarations('bodyXs')}
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
