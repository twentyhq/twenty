import { useContext, useLayoutEffect } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type ToastProps } from '../../types/ToastProps';
import { ToastTimingContext } from '../contexts/ToastTimingContext';
import { type createToastCountdownStore } from '../utils/createToastCountdownStore';

type ToastCountdownEffectProps = Pick<ToastProps, 'progress' | 'onClose'> & {
  clock: ReturnType<typeof createToastCountdownStore>;
  onClockChange: (clock: ReturnType<typeof createToastCountdownStore>) => void;
  duration: number;
  isPaused: boolean;
};

export const ToastCountdownEffect = ({
  clock,
  onClockChange,
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
  const isSharedCountdown =
    isDefined(lifecycle) && isDefined(id) && isDefined(rendererKey);
  const standaloneClock = isSharedCountdown ? undefined : clock;
  const isProgress = isDefined(progress);
  const isDurationOverridden =
    isDefined(timingOverrides) &&
    Object.prototype.propertyIsEnumerable.call(timingOverrides, 'duration');
  const isProgressOverridden =
    isDefined(timingOverrides) &&
    Object.prototype.propertyIsEnumerable.call(timingOverrides, 'progress');

  useLayoutEffect(() => {
    if (isSharedCountdown) {
      const sharedClock = lifecycle.updateRenderer({
        id,
        key: rendererKey,
        configuration: {
          duration: isDurationOverridden ? duration : undefined,
          isProgress: isProgressOverridden ? isProgress : undefined,
          isPaused,
        },
      });
      onClockChange(sharedClock);
      return;
    }

    standaloneClock?.update({
      duration,
      durationRevision,
      isPaused,
      isProgress,
      isActive,
      onClose,
    });
  }, [
    standaloneClock,
    onClockChange,
    isSharedCountdown,
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
      if (isSharedCountdown) {
        lifecycle.removeRenderer({ id, key: rendererKey });
        return;
      }

      standaloneClock?.stop();
    },
    [standaloneClock, lifecycle, id, rendererKey, isSharedCountdown],
  );

  return null;
};
