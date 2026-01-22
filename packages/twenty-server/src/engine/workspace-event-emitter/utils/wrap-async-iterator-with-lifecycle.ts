type AsyncIteratorLifecycleOptions = {
  onHeartbeat?: () => Promise<boolean>;
  heartbeatIntervalMs?: number;
  onCleanup?: () => Promise<void>;
};

export function wrapAsyncIteratorWithLifecycle<T>(
  iterator: AsyncIterableIterator<T>,
  options: AsyncIteratorLifecycleOptions,
): AsyncIterableIterator<T> {
  const { onHeartbeat, heartbeatIntervalMs, onCleanup } = options;
  let heartbeatInterval: NodeJS.Timeout | null = null;

  if (onHeartbeat && heartbeatIntervalMs) {
    heartbeatInterval = setInterval(async () => {
      try {
        await onHeartbeat();
      } catch {
        // Heartbeat failure shouldn't crash the stream
      }
    }, heartbeatIntervalMs);
  }

  const cleanup = async () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
    if (onCleanup) {
      await onCleanup();
    }
  };

  return {
    next: () => iterator.next(),
    return: async () => {
      let result: IteratorResult<T>;

      try {
        await cleanup();
      } finally {
        result = (await iterator.return?.()) ?? {
          done: true,
          value: undefined,
        };
      }

      return result;
    },
    throw: async (error) => {
      await cleanup();
      if (iterator.throw) {
        return iterator.throw(error);
      }
      throw error;
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
}
