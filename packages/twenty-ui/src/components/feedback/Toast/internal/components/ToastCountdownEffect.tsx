import { useContext, useLayoutEffect } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type ToastProps } from '../../types/ToastProps';
import { ToastTimingContext } from '../contexts/ToastTimingContext';
import { type createToastCountdownStore } from '../utils/createToastCountdownStore';

type ToastCountdownEffectProps = Pick<ToastProps, 'progress' | 'onClose'> & {
  clock: ReturnType<typeof createToastCountdownStore>;
  duration: number;
  isPaused: boolean;
};

export const ToastCountdownEffect = ({
  clock,
  duration,
  progress,
  isPaused,
  onClose,
}: ToastCountdownEffectProps) => {
  const {
    durationRevision,
    isActive,
    lifecycle,
    id,
    rendererKey,
    timingOverrides,
  } = useContext(ToastTimingContext);
  const isProgress = isDefined(progress);
  const isDurationOverridden =
    isDefined(timingOverrides) &&
    Object.prototype.propertyIsEnumerable.call(timingOverrides, 'duration');
  const isProgressOverridden =
    isDefined(timingOverrides) &&
    Object.prototype.propertyIsEnumerable.call(timingOverrides, 'progress');

  useLayoutEffect(() => {
    if (isDefined(lifecycle) && isDefined(id) && isDefined(rendererKey)) {
      lifecycle.updateRenderer({
        id,
        key: rendererKey,
        configuration: {
          duration: isDurationOverridden ? duration : undefined,
          isProgress: isProgressOverridden ? isProgress : undefined,
          isPaused,
        },
      });
      return;
    }

    clock.update({
      duration,
      durationRevision,
      isPaused,
      isProgress,
      isActive,
      onClose,
    });
  }, [
    clock,
    duration,
    durationRevision,
    isPaused,
    isProgress,
    isActive,
    onClose,
    lifecycle,
    id,
    rendererKey,
    isDurationOverridden,
    isProgressOverridden,
  ]);

  useLayoutEffect(
    () => () => {
      if (isDefined(lifecycle) && isDefined(id) && isDefined(rendererKey)) {
        lifecycle.removeRenderer({ id, key: rendererKey });
        return;
      }

      clock.stop();
    },
    [clock, lifecycle, id, rendererKey],
  );

  return null;
};
