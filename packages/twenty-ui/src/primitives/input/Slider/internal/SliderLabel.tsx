import { Slider as SliderPrimitive } from '@base-ui/react/slider';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Slider.module.scss';
import { type SliderLabelProps } from '../types/SliderLabelProps';

export const SliderLabel = ({ className, ...props }: SliderLabelProps) => (
  <SliderPrimitive.Label
    {...props}
    className={mergeClassNames(styles.label, className)}
  />
);
