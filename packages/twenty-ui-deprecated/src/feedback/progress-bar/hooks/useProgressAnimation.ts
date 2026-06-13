import { millisecondsToSeconds } from 'date-fns';
import {
  animate,
  type AnimationPlaybackControls,
  type ValueAnimationTransition,
} from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useProgressAnimation = ({
  autoPlay = true,
  initialValue = 0,
  finalValue = 100,
  options,
}: {
  autoPlay?: boolean;
  initialValue?: number;
  finalValue?: number;
  options?: ValueAnimationTransition<number>;
}) => {
  const [animation, setAnimation] = useState<
    AnimationPlaybackControls | undefined
  >();
  const [value, setValue] = useState(initialValue);

  const startAnimation = useCallback(() => {
    if (isDefined(animation)) return;

    const duration = isDefined(options?.duration)
      ? millisecondsToSeconds(options.duration)
      : undefined;

    setAnimation(
      animate(initialValue, finalValue, {
        ...options,
        duration,
        onUpdate: (nextValue) => {
          if (value === nextValue) return;
          setValue(nextValue);
          options?.onUpdate?.(nextValue);
        },
      }),
    );
  }, [animation, finalValue, initialValue, options, value]);

  useEffect(() => {
    if (autoPlay && !animation) {
      startAnimation();
    }
  }, [animation, autoPlay, startAnimation]);

  return {
    animation,
    startAnimation,
    value,
  };
};
