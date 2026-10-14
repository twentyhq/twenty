import { useContext, useLayoutEffect } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type ToastProps } from '../../types/ToastProps';
import { ToastTimingContext } from '../contexts/ToastTimingContext';
import { type createToastCountdown } from '../utils/createToastCountdown';

type ToastCountdownEffectProps = Pick<ToastProps, 'progress' | 'onClose'> & {
  clock: ReturnType<typeof createToastCountdown>;
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
  const { durationRevision, isActive } = useContext(ToastTimingContext);
  const isProgress = isDefined(progress);

  useLayoutEffect(() => {
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
  ]);

  useLayoutEffect(() => () => clock.stop(), [clock]);

  return null;
};
