import { styled } from '@linaria/react';

import { type ThemeColor } from '@ui/theme';
import { themeCssVariables } from '@ui/theme-constants';
import { isDefined } from 'twenty-shared/utils';

export type ColorSampleVariant = 'circle' | 'default' | 'pipeline';

type StyledColorSampleProps = {
  colorName: ThemeColor;
  color?: string;
  variant?: ColorSampleVariant;
};

export type ColorSampleProps = StyledColorSampleProps & {
  className?: string;
};

const getColor = (colorName: ThemeColor, color?: string) => {
  if (isDefined(color)) {
    return color;
  }

  return themeCssVariables.tag.background[colorName];
};

const getBorderColor = (colorName: ThemeColor) => {
  return themeCssVariables.tag.text[colorName];
};

const StyledColorSample = styled.div<StyledColorSampleProps>`
  background-color: ${({ colorName, color }) => getColor(colorName, color)};
  border: ${({ variant, colorName }) =>
    variant === 'pipeline' ? '0' : `1px solid ${getBorderColor(colorName)}`};
  border-radius: ${({ variant }) => (variant === 'circle' ? '50%' : '60px')};
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[4]};
  width: ${({ variant }) =>
    variant === 'circle'
      ? themeCssVariables.spacing[4]
      : themeCssVariables.spacing[3]};
  align-items: ${({ variant }) =>
    variant === 'pipeline' ? 'center' : 'initial'};
  display: ${({ variant }) => (variant === 'pipeline' ? 'flex' : 'block')};
  justify-content: ${({ variant }) =>
    variant === 'pipeline' ? 'center' : 'initial'};

  &:after {
    background-color: ${({ colorName, color, variant }) =>
      variant === 'pipeline' ? getColor(colorName, color) : 'transparent'};
    border-radius: ${({ variant }) =>
      variant === 'pipeline' ? themeCssVariables.border.radius.rounded : '0'};
    content: ${({ variant }) => (variant === 'pipeline' ? "''" : 'none')};
    display: ${({ variant }) => (variant === 'pipeline' ? 'block' : 'none')};
    height: ${({ variant }) =>
      variant === 'pipeline' ? themeCssVariables.spacing[1] : '0'};
    width: ${({ variant }) =>
      variant === 'pipeline' ? themeCssVariables.spacing[1] : '0'};
  }
`;

export const ColorSample = ({
  colorName,
  color,
  variant,
  className,
}: ColorSampleProps) => {
  return (
    <StyledColorSample
      colorName={colorName}
      color={color}
      variant={variant}
      className={className}
    />
  );
};
