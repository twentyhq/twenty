import { useState } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type ToastProps } from '../../types/ToastProps';
import { createToastCountdown } from '../utils/createToastCountdown';

export const useToastCountdown = ({
  duration,
  progress,
  isPaused,
}: Pick<ToastProps, 'progress'> & {
  duration: number;
  isPaused: boolean;
}) => {
  const [countdown, setCountdown] = useState({
    duration,
    remainingDuration: duration,
    revision: 0,
    isPaused,
    isProgress: isDefined(progress),
  });
  const [clock] = useState(() =>
    createToastCountdown({ onChange: setCountdown }),
  );

  return { countdown, clock };
};
