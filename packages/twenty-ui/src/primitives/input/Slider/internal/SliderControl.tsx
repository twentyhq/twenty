import { Slider as SliderPrimitive } from '@base-ui/react/slider';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Slider.module.scss';
import { type SliderControlProps } from '../types/SliderControlProps';

export const SliderControl = ({ className, ...props }: SliderControlProps) => (
  <SliderPrimitive.Control
    {...props}
    className={mergeClassNames(styles.control, className)}
  />
);
