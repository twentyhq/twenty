import { createToastCountdown } from './createToastCountdown';

type CountdownSnapshot = Parameters<
  Parameters<typeof createToastCountdown>[0]['onChange']
>[0];

export const createToastCountdownStore = ({
  duration,
  isPaused,
}: Pick<CountdownSnapshot, 'duration' | 'isPaused'>) => {
  let snapshot: CountdownSnapshot = {
    duration,
    remainingDuration: duration,
    revision: 0,
    isPaused,
  };
  const listeners = new Set<() => void>();
  const countdown = createToastCountdown({
    onChange: (nextSnapshot) => {
      snapshot = nextSnapshot;

      for (const listener of listeners) {
        listener();
      }
    },
  });

  return {
    ...countdown,
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};
