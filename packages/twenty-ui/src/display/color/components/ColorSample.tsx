import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { type ThemeColor, type ThemeType } from '@ui/theme';
import { isDefined } from 'twenty-shared/utils';

export type ColorSampleVariant = 'default' | 'pipeline';

export type ColorSampleProps = {
  colorName: ThemeColor;
  color?: string;
  variant?: ColorSampleVariant;
};

const getColor = (theme: ThemeType, colorName: ThemeColor, color?: string) => {
  if (isDefined(color)) {
    return color;
  }

  return theme.tag.background[colorName];
};

const getBorderColor = (theme: ThemeType, colorName: ThemeColor) => {
  return theme.tag.text[colorName];
};

const StyledColorSample = styled.div<ColorSampleProps>`
  background-color: ${({ theme, colorName, color }) =>
    getColor(theme, colorName, color)};
  border: 1px solid
    ${({ theme, colorName }) => getBorderColor(theme, colorName)};
  border-radius: 60px;
  height: ${({ theme }) => theme.spacing(4)};
  width: ${({ theme }) => theme.spacing(3)};

  ${({ colorName, color, theme, variant }) => {
    if (variant === 'pipeline')
      return css`
        align-items: center;
        border: 0;
        display: flex;
        justify-content: center;

        &:after {
          background-color: ${getColor(theme, colorName, color)};
          border-radius: ${theme.border.radius.rounded};
          content: '';
          display: block;
          height: ${theme.spacing(1)};
          width: ${theme.spacing(1)};
        }
      `;
  }}
`;

export { StyledColorSample as ColorSample };
