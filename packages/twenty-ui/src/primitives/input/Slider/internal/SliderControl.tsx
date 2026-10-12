import { Slider as SliderPrimitive } from '@base-ui/react/slider';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useContext } from 'react';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Slider.module.scss';
import { type SliderControlProps } from '../types/SliderControlProps';
import { SliderControlRegistrationContext } from './SliderControlRegistrationContext';

export const SliderControl = ({
  className,
  ref,
  ...props
}: SliderControlProps) => {
  const registerControl = useContext(SliderControlRegistrationContext);
  const mergedRef = useMergedRefs(ref, registerControl);

  return (
    <SliderPrimitive.Control
      {...props}
      ref={mergedRef}
      data-twenty-ui-slider-control=""
      className={mergeClassNames(styles.control, className)}
    />
  );
};
