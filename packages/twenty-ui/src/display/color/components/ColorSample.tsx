import { styled } from '@linaria/react';
import { useContext } from 'react';

import { type ThemeColor, ThemeContext, type ThemeType } from '@ui/theme';
import { isDefined } from 'twenty-shared/utils';

export type ColorSampleVariant = 'default' | 'pipeline';

type StyledColorSampleProps = {
  colorName: ThemeColor;
  color?: string;
  variant?: ColorSampleVariant;
  theme: ThemeType;
};

export type ColorSampleProps = Omit<StyledColorSampleProps, 'theme'>;

const getColor = (theme: ThemeType, colorName: ThemeColor, color?: string) => {
  if (isDefined(color)) {
    return color;
  }

  return theme.tag.background[colorName];
};

const getBorderColor = (theme: ThemeType, colorName: ThemeColor) => {
  return theme.tag.text[colorName];
};

const StyledColorSample = styled.div<StyledColorSampleProps>`
  background-color: ${({ theme, colorName, color }) =>
    getColor(theme, colorName, color)};
  border: 1px solid
    ${({ theme, colorName }) => getBorderColor(theme, colorName)};
  border-radius: 60px;
  height: ${({ theme }) => theme.spacing(4)};
  width: ${({ theme }) => theme.spacing(3)};

  ${({ colorName, color, theme, variant }) => {
    if (variant === 'pipeline')
      return `
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

    return '';
  }}
`;

export const ColorSample = ({
  colorName,
  color,
  variant,
}: ColorSampleProps) => {
  const { theme } = useContext(ThemeContext);
  return (
    <StyledColorSample
      colorName={colorName}
      color={color}
      variant={variant}
      theme={theme}
    />
  );
};
