import { type PendingWakeUpOutcome } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-outcome.type';

export const buildDefaultWaitResult = (
  outcome: PendingWakeUpOutcome,
): object => {
  switch (outcome.type) {
    case 'TIME_ELAPSED':
      return { success: true };
    case 'EVENT_RECEIVED':
      return { hasTimedOut: false, ...outcome.event };
    case 'EXPIRED':
      return { hasTimedOut: true };
  }
};
