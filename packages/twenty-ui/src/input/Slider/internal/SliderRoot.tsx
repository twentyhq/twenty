import { Slider as SliderPrimitive } from '@base-ui/react/slider';
import { clsx } from 'clsx';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Slider.module.scss';
import { type SliderRootProps } from '../types/SliderRootProps';

export const SliderRoot = <TValue extends number | readonly number[]>({
  className,
  color = 'accent',
  thumbAlignment = 'edge',
  ...props
}: SliderRootProps<TValue>) => (
  <SliderPrimitive.Root
    {...props}
    thumbAlignment={thumbAlignment}
    className={mergeClassNames(clsx(styles.root, styles[color]), className)}
  />
);
