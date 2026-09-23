import { Slider as SliderPrimitive } from '@base-ui/react/slider';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Slider.module.scss';
import { type SliderTrackProps } from '../types/SliderTrackProps';

export const SliderTrack = ({ className, ...props }: SliderTrackProps) => (
  <SliderPrimitive.Track
    {...props}
    className={mergeClassNames(styles.track, className)}
  />
);
