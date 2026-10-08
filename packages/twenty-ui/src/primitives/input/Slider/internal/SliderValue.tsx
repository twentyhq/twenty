import { Slider as SliderPrimitive } from '@base-ui/react/slider';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Slider.module.scss';
import { type SliderValueProps } from '../types/SliderValueProps';

export const SliderValue = ({ className, ...props }: SliderValueProps) => (
  <SliderPrimitive.Value
    {...props}
    className={mergeClassNames(styles.value, className)}
  />
);
