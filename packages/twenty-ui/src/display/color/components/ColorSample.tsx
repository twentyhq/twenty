import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import { type ThemeColor } from '@ui/theme';

export type ColorSampleVariant = 'default' | 'pipeline';

export type ColorSampleProps = {
  colorName: ThemeColor;
  variant?: ColorSampleVariant;
};

const StyledColorSample = styled.div<ColorSampleProps>`
  background-color: ${({ colorName }) => `var(--tag-background-${colorName})`};
  border: 1px solid ${({ colorName }) => `var(--tag-text-${colorName})`};
  border-radius: 60px;
  height: var(--spacing-4);
  width: var(--spacing-3);

  ${({ colorName, variant }) => {
    if (variant === 'pipeline') {
      return css`
        align-items: center;
        border: 0;
        display: flex;
        justify-content: center;

        &:after {
          background-color: ${`var(--tag-text-${colorName})`};
          border-radius: var(--border-radius-rounded);
          content: '';
          display: block;
          height: var(--spacing-1);
          width: var(--spacing-1);
        }
      `;
    }
    return css``;
  }}
`;

export { StyledColorSample as ColorSample };
