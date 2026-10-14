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
  const { lifecycle, id, rendererKey } = useContext(ToastTimingContext);
  const [clock, setClock] = useState(() => {
    const sharedClock =
      isDefined(lifecycle) && isDefined(id) && isDefined(rendererKey)
        ? lifecycle.getCountdown(id)
        : undefined;

    return sharedClock ?? createToastCountdownStore({ duration, isPaused });
  });
  const countdown = useSyncExternalStore(
    clock.subscribe,
    clock.getSnapshot,
    clock.getSnapshot,
  );

  return { countdown, clock, setClock };
};
