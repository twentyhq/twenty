export function wrapAsyncIteratorWithCleanup<T>(
  iterator: AsyncIterableIterator<T>,
  onClose: () => void | Promise<void>,
): AsyncIterableIterator<T> {
  return {
    next: () => iterator.next(),
    return: async () => {
      let result: IteratorResult<T>;

      try {
        await onClose();
      } finally {
        result = (await iterator.return?.()) ?? {
          done: true,
          value: undefined,
        };
      }

      return result;
    },
    throw: async (error) => {
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
