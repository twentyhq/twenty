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
  border: ${({ variant, theme, colorName }) =>
    variant === 'pipeline'
      ? '0'
      : `1px solid ${getBorderColor(theme, colorName)}`};
  border-radius: 60px;
  height: ${({ theme }) => theme.spacing(4)};
  width: ${({ theme }) => theme.spacing(3)};
  align-items: ${({ variant }) =>
    variant === 'pipeline' ? 'center' : 'initial'};
  display: ${({ variant }) => (variant === 'pipeline' ? 'flex' : 'block')};
  justify-content: ${({ variant }) =>
    variant === 'pipeline' ? 'center' : 'initial'};

  &:after {
    background-color: ${({ colorName, color, theme, variant }) =>
      variant === 'pipeline'
        ? getColor(theme, colorName, color)
        : 'transparent'};
    border-radius: ${({ theme, variant }) =>
      variant === 'pipeline' ? theme.border.radius.rounded : '0'};
    content: ${({ variant }) => (variant === 'pipeline' ? "''" : 'none')};
    display: ${({ variant }) => (variant === 'pipeline' ? 'block' : 'none')};
    height: ${({ theme, variant }) =>
      variant === 'pipeline' ? theme.spacing(1) : '0'};
    width: ${({ theme, variant }) =>
      variant === 'pipeline' ? theme.spacing(1) : '0'};
  }
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
