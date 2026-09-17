import { Slider as SliderPrimitive } from '@base-ui/react/slider';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Slider.module.scss';
import { type SliderIndicatorProps } from '../types/SliderIndicatorProps';

export const SliderIndicator = ({
  className,
  ...props
}: SliderIndicatorProps) => (
  <SliderPrimitive.Indicator
    {...props}
    className={mergeClassNames(styles.indicator, className)}
  />
);
