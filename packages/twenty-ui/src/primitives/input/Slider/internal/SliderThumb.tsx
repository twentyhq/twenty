import { Slider as SliderPrimitive } from '@base-ui/react/slider';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Slider.module.scss';
import { type SliderThumbProps } from '../types/SliderThumbProps';

export const SliderThumb = ({ className, ...props }: SliderThumbProps) => (
  <SliderPrimitive.Thumb
    {...props}
    className={mergeClassNames(styles.thumb, className)}
  />
);
