import { isDefined } from 'twenty-shared/utils';

type AsyncIteratorLifecycleOptions<TValue> = {
  initialValue?: TValue;
  onHeartbeat?: () => Promise<boolean>;
  heartbeatIntervalMs?: number;
  heartbeatStart?: 'immediate' | 'on-first-next';
  heartbeatErrorBehavior?: 'ignore' | 'close';
  onCleanup?: () => Promise<void>;
  onCleanupError?: (error: unknown) => void;
};

export function wrapAsyncIteratorWithLifecycle<TValue>(
  createIterator: (signal: AbortSignal) => AsyncIterableIterator<TValue>,
  options: AsyncIteratorLifecycleOptions<TValue>,
): AsyncIterableIterator<TValue> {
  const {
    initialValue,
    onHeartbeat,
    heartbeatIntervalMs,
    heartbeatStart = 'on-first-next',
    heartbeatErrorBehavior = 'ignore',
    onCleanup,
    onCleanupError,
  } = options;
  const abortController = new AbortController();
  const { signal } = abortController;
  const iterator = createIterator(signal);
  let heartbeatInterval: NodeJS.Timeout | undefined;
  let heartbeat: Promise<void> | undefined;
  let heartbeatStarted = false;
  let hasYieldedInitialValue = false;
  let cleanup: Promise<void> | undefined;
  let failure: { error: unknown } | undefined;

  const close = () => {
    if (!isDefined(cleanup)) {
      abortController.abort();
      clearInterval(heartbeatInterval);
      cleanup = Promise.resolve().then(async () => {
        try {
          await heartbeat;
          try {
            await onCleanup?.();
          } catch (error) {
            if (!isDefined(onCleanupError)) {
              throw error;
            }
            onCleanupError(error);
          }
        } finally {
          await iterator.return?.();
        }
      });
    }
    return cleanup;
  };

  const startHeartbeat = () => {
    if (
      heartbeatStarted ||
      signal.aborted ||
      !isDefined(onHeartbeat) ||
      !isDefined(heartbeatIntervalMs)
    ) {
      return;
    }
    heartbeatStarted = true;
    heartbeatInterval = setInterval(() => {
      if (isDefined(heartbeat) || signal.aborted) {
        return;
      }
      heartbeat = Promise.resolve()
        .then(() => (signal.aborted ? false : onHeartbeat()))
        .then((shouldContinue) => {
          if (!shouldContinue) {
            clearInterval(heartbeatInterval);
          }
        })
        .catch((error: unknown) => {
          if (signal.aborted || heartbeatErrorBehavior === 'ignore') {
            return;
          }
          failure = { error };
          void close().catch(() => {});
        })
        .finally(() => {
          heartbeat = undefined;
        });
    }, heartbeatIntervalMs);
  };

  if (heartbeatStart === 'immediate') {
    startHeartbeat();
  }

  return {
    next: async () => {
      if (signal.aborted) {
        await close();
        if (isDefined(failure)) {
          throw failure.error;
        }
        return { done: true, value: undefined };
      }
      startHeartbeat();
      if (isDefined(initialValue) && !hasYieldedInitialValue) {
        hasYieldedInitialValue = true;
        return { done: false, value: initialValue };
      }
      try {
        const result = await iterator.next();
        if (result.done || signal.aborted) {
          await close();
          if (isDefined(failure)) {
            throw failure.error;
          }
          return { done: true, value: result.done ? result.value : undefined };
        }
        return result;
      } catch (error) {
        const wasAborted = signal.aborted;
        await close();
        if (isDefined(failure)) {
          throw failure.error;
        }
        if (wasAborted) {
          return { done: true, value: undefined };
        }
        throw error;
      }
    },
    return: async () => {
      await close();
      return { done: true, value: undefined };
    },
    throw: async (error: unknown) => {
      try {
        await close();
      } finally {
        throw error;
      }
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
}
