import { clsx } from 'clsx';

import { type ThemeColor } from '@ui/theme';
import { themeCssVariables } from '@ui/theme-constants';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './ColorSample.module.scss';

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

export const ColorSample = ({
  colorName,
  color,
  variant,
  className,
}: ColorSampleProps) => {
  return (
    <div
      className={clsx(
        styles.root,
        variant === 'circle' && styles.circle,
        variant === 'pipeline' && styles.pipeline,
        className,
      )}
      style={
        {
          '--color-sample-color': getColor(colorName, color),
          '--color-sample-border-color': getBorderColor(colorName),
        } as React.CSSProperties
      }
    />
  );
};
