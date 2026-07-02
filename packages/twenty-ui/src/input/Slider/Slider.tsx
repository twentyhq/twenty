import { clsx } from 'clsx';
import {
  type ChangeEvent,
  type CSSProperties,
  type InputHTMLAttributes,
} from 'react';

import { type ThemeColor } from '@ui/theme';
import { themeCssVariables } from '@ui/theme-constants';

import styles from './Slider.module.scss';

export type SliderColor = ThemeColor;

export type SliderProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'max' | 'min' | 'onChange' | 'step' | 'type' | 'value'
> & {
  max: number;
  min?: number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  step?: number;
  value: number;
  color?: SliderColor;
};

const getSliderProgress = ({
  max,
  min,
  value,
}: {
  max: number;
  min: number;
  value: number;
}) => {
  if (max <= min) {
    return 0;
  }

  return Math.min(1, Math.max(0, (value - min) / (max - min)));
};

const getSliderFill = ({
  max,
  min,
  value,
}: {
  max: number;
  min: number;
  value: number;
}) => {
  const progress = getSliderProgress({ max, min, value });

  return `calc(${progress * 100}% + (1 - ${progress}) * var(--slider-track-size))`;
};

export const Slider = ({
  className,
  color = 'blue',
  disabled,
  max,
  min = 0,
  onChange,
  step = 1,
  style,
  value,
  ...props
}: SliderProps) => {
  const sliderColor = `${color}9` as keyof typeof themeCssVariables.color;

  return (
    <div
      className={clsx(styles.slider, className)}
      data-disabled={disabled || undefined}
      style={
        {
          ...style,
          '--slider-fill': getSliderFill({ max, min, value }),
          '--slider-main-color': themeCssVariables.color[sliderColor],
        } as CSSProperties
      }
    >
      <div className={styles.track}>
        <div className={styles.fill} />
      </div>
      <input
        className={styles.input}
        disabled={disabled}
        max={max}
        min={min}
        onChange={onChange}
        step={step}
        type="range"
        value={value}
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
    </div>
  );
};
