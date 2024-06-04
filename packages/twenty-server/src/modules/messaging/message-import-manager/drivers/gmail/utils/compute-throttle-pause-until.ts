import { MESSAGING_THROTTLE_DURATION } from 'src/modules/messaging/common/constants/messaging-throttle-duration';

export const computeThrottlePauseUntil = (
  startTime: string | undefined,
  throttleFailureCount: number,
): Date => {
  return new Date(
    startTime
      ? new Date(startTime).getTime()
      : Date.now() +
        MESSAGING_THROTTLE_DURATION * Math.pow(2, throttleFailureCount),
  );
};
