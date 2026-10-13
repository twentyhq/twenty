import { useContext, useLayoutEffect, useState } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type ToastProps } from '../../types/ToastProps';
import { ToastTimingContext } from '../contexts/ToastTimingContext';
import { createToastCountdown } from '../utils/createToastCountdown';

export const useToastCountdown = ({
  duration,
  progress,
  isPaused,
  onClose,
}: Pick<ToastProps, 'progress' | 'onClose'> & {
  duration: number;
  isPaused: boolean;
}) => {
  const { durationRevision, isActive } = useContext(ToastTimingContext);
  const isProgress = isDefined(progress);
  const [countdown, setCountdown] = useState({
    duration,
    remainingDuration: duration,
    revision: 0,
    isPaused,
    isProgress,
  });
  const [clock] = useState(() =>
    createToastCountdown({ onChange: setCountdown }),
  );

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

  return { countdown, close: clock.close };
};
