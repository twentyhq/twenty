import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { ThemeColor } from '@ui/theme';

export type ColorSampleVariant = 'default' | 'pipeline';

export type ColorSampleProps = {
  colorName: ThemeColor;
  variant?: ColorSampleVariant;
};

const StyledColorSample = styled.div<ColorSampleProps>`
  background-color: ${({ theme, colorName }) =>
    theme.tag.background[colorName]};
  border: 1px solid ${({ theme, colorName }) => theme.tag.text[colorName]};
  border-radius: 60px;
  height: ${({ theme }) => theme.spacing(4)};
  width: ${({ theme }) => theme.spacing(3)};

  ${({ colorName, theme, variant }) => {
    if (variant === 'pipeline')
      return css`
        align-items: center;
        border: 0;
        display: flex;
        justify-content: center;

        &:after {
          background-color: ${theme.tag.text[colorName]};
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
