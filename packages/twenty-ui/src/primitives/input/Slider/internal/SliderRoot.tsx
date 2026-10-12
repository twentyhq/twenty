import { Slider as SliderPrimitive } from '@base-ui/react/slider';
import { clsx } from 'clsx';
import { useLayoutEffect, useState } from 'react';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../Slider.module.scss';
import { type SliderRootProps } from '../types/SliderRootProps';
import { SliderControlRegistrationContext } from './SliderControlRegistrationContext';

export const SliderRoot = <TValue extends number | readonly number[]>({
  className,
  color = 'accent',
  thumbAlignment = 'edge',
  ...props
}: SliderRootProps<TValue>) => {
  const [control, setControl] = useState<HTMLDivElement | null>(null);
  const [initializedControl, setInitializedControl] =
    useState<HTMLDivElement | null>(null);
  const shouldInitializeControl =
    isDefined(control) &&
    control !== initializedControl &&
    thumbAlignment !== 'center';

  useLayoutEffect(() => {
    setInitializedControl(control);
  }, [control]);

  return (
    <SliderControlRegistrationContext.Provider value={setControl}>
      <SliderPrimitive.Root
        {...props}
        thumbAlignment={shouldInitializeControl ? 'center' : thumbAlignment}
        className={mergeClassNames(clsx(styles.root, styles[color]), className)}
      />
    </SliderControlRegistrationContext.Provider>
  );
};
