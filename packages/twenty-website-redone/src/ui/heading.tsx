import { css } from '@linaria/core';
import { Fragment } from 'react';

import {
  fluidFontSize,
  FONT_WEIGHT,
  fontFamily,
  type FontWeightToken,
} from '@/tokens';

import { parseHeadingNotation } from './heading-notation';

const headingClassName = css`
  margin: 0;
  text-wrap: balance;

  &[data-family='serif'] {
    font-family: ${fontFamily('serif')};
    letter-spacing: -0.02em;
  }

  &[data-family='sans'] {
    font-family: ${fontFamily('sans')};
    letter-spacing: -0.04em;
  }

  &[data-weight='light'] {
    font-weight: ${FONT_WEIGHT.light};
  }

  &[data-weight='regular'] {
    font-weight: ${FONT_WEIGHT.regular};
  }

  &[data-weight='medium'] {
    font-weight: ${FONT_WEIGHT.medium};
  }

  &[data-size='xl'] {
    font-size: ${fluidFontSize(15, 20)};
    line-height: 1.1;
  }

  &[data-size='lg'] {
    font-size: ${fluidFontSize(10, 15)};
    line-height: 1.15;
  }

  &[data-size='md'] {
    font-size: ${fluidFontSize(10, 12)};
    line-height: 1.17;
  }

  &[data-size='sm'] {
    font-size: ${fluidFontSize(8, 8)};
    line-height: 1.25;
  }

  &[data-size='xs'] {
    font-size: ${fluidFontSize(4.5, 5.5)};
    line-height: 1.33;
  }

  [data-accent] {
    letter-spacing: -0.04em;
  }

  &[data-family='serif'] [data-accent] {
    font-family: ${fontFamily('sans')};
  }

  &[data-family='sans'] [data-accent] {
    font-family: ${fontFamily('serif')};
    letter-spacing: -0.02em;
  }
`;

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type HeadingSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs';
export type HeadingFamily = 'serif' | 'sans';

export type HeadingProps = {
  as?: HeadingLevel;
  children: string;
  family?: HeadingFamily;
  size?: HeadingSize;
  weight?: FontWeightToken;
};

export function Heading({
  as: Tag = 'h2',
  children,
  family = 'serif',
  size = 'md',
  weight = 'regular',
}: HeadingProps) {
  return (
    <Tag
      className={headingClassName}
      data-family={family}
      data-size={size}
      data-weight={weight}
    >
      {parseHeadingNotation(children).map((segment, index) =>
        segment.kind === 'accent' ? (
          <span data-accent key={index}>
            {segment.text}
          </span>
        ) : (
          <Fragment key={index}>{segment.text}</Fragment>
        ),
      )}
    </Tag>
  );
}
