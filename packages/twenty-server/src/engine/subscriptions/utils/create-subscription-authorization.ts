import { isDefined } from 'twenty-shared/utils';

// A failed check stays terminal so a buffered event cannot outlive a revoked grant
export const createSubscriptionAuthorization = ({
  check,
  maxAgeMs,
}: {
  check: () => Promise<unknown>;
  maxAgeMs: number;
}) => {
  let validUntil = 0;
  let inFlight: Promise<void> | undefined;

  return async (force = false): Promise<void> => {
    if (isDefined(inFlight)) {
      return inFlight;
    }
    if (!force && Date.now() < validUntil) {
      return;
    }
    const checkedAt = Date.now();
    inFlight = Promise.resolve()
      .then(check)
      .then(() => {
        validUntil = checkedAt + maxAgeMs;
        inFlight = undefined;
      });
    return inFlight;
  };
};
