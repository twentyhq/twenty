import { isDefined } from 'twenty-shared/utils';

export type DeadlineLateSettlement =
  | { status: 'fulfilled' }
  | { status: 'rejected'; error: unknown };

export const withDeadline = async <TResult>({
  promise,
  timeoutMs,
  createTimeoutError,
  onSettleAfterDeadline,
}: {
  promise: Promise<TResult>;
  timeoutMs: number;
  createTimeoutError: () => Error;
  onSettleAfterDeadline?: (settlement: DeadlineLateSettlement) => void;
}): Promise<TResult> => {
  let timeoutId: NodeJS.Timeout | undefined;
  let hasTimedOut = false;

  const deadline = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      hasTimedOut = true;
      reject(createTimeoutError());
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, deadline]);
  } finally {
    clearTimeout(timeoutId);

    if (hasTimedOut && isDefined(onSettleAfterDeadline)) {
      promise.then(
        () => onSettleAfterDeadline({ status: 'fulfilled' }),
        (error: unknown) =>
          onSettleAfterDeadline({ status: 'rejected', error }),
      );
    }
  }
};
