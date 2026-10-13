import { useContext, useState, useSyncExternalStore } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { ToastTimingContext } from '../contexts/ToastTimingContext';
import { createToastCountdownStore } from '../utils/createToastCountdownStore';

export const useToastCountdown = ({
  duration,
  isPaused,
}: {
  duration: number;
  isPaused: boolean;
}) => {
  const { lifecycle, id } = useContext(ToastTimingContext);
  const [clock] = useState(() =>
    isDefined(lifecycle) && isDefined(id)
      ? lifecycle.getCountdown(id)
      : createToastCountdownStore({ duration, isPaused }),
  );
  const countdown = useSyncExternalStore(
    clock.subscribe,
    clock.getSnapshot,
    clock.getSnapshot,
  );

  return { countdown, clock };
};
