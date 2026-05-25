import { isDefined } from 'twenty-shared/utils';

import { MESSAGING_THROTTLE_DURATION } from 'src/modules/messaging/message-import-manager/constants/messaging-throttle-duration';
import { isValidDate } from 'src/utils/date/isValidDate';

export const isThrottled = (
  syncStageStartedAt: string | null,
  throttleFailureCount: number,
  throttleRetryAfter?: string | null,
): boolean => {
  const now = new Date();

  const retryAfterCandidate = isDefined(throttleRetryAfter)
    ? new Date(throttleRetryAfter)
    : null;
  const retryAfterDate = isValidDate(retryAfterCandidate)
    ? retryAfterCandidate
    : null;

  if (isDefined(retryAfterDate) && retryAfterDate > now) {
    return true;
  }

  if (!syncStageStartedAt) {
    return false;
  }

  if (throttleFailureCount === 0) {
    return false;
  }

  const exponentialBackoffUntil = computeThrottlePauseUntil(
    syncStageStartedAt,
    throttleFailureCount,
  );

  return exponentialBackoffUntil > now;
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
