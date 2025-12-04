import { MESSAGING_THROTTLE_DURATION } from 'src/modules/messaging/message-import-manager/constants/messaging-throttle-duration';

export const isThrottled = (
  syncStageStartedAt: string | null,
  throttleFailureCount: number,
): boolean => {
  if (!syncStageStartedAt) {
    return false;
  }

  if (throttleFailureCount === 0) {
    return false;
  }

  return (
    computeThrottlePauseUntil(syncStageStartedAt, throttleFailureCount) >
    new Date()
  );
};

const computeThrottlePauseUntil = (
  syncStageStartedAt: string,
  throttleFailureCount: number,
): Date => {
  return new Date(
    new Date(syncStageStartedAt).getTime() +
      MESSAGING_THROTTLE_DURATION * Math.pow(2, throttleFailureCount - 1),
  );
};
