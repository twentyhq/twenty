import { MESSAGING_THROTTLE_DURATION } from 'src/modules/messaging/common/constants/messaging-throttle-duration';

export const computeThrottlePauseUntil = (
  startTime: string,
  throttleFailureCount: number,
): Date => {
  return new Date(
    new Date(startTime).getTime() +
      MESSAGING_THROTTLE_DURATION * Math.pow(2, throttleFailureCount),
  );
};
