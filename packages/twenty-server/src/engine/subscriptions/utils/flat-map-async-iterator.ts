import { isDefined } from 'twenty-shared/utils';

// Not an async generator, like filterMapAsyncIterator. The source is read before the prefix, so
// a value published while the prefix loads is kept, and a prefix that fails closes the source
export const flatMapAsyncIterator = async <TValue, TMappedValue>({
  iterator,
  readPrefix,
  mapValue,
  isDone,
}: {
  iterator: AsyncIterator<TValue>;
  readPrefix: () => Promise<TMappedValue[]>;
  mapValue: (value: TValue) => Promise<TMappedValue[]>;
  // checked once the values read so far are all handed out
  isDone?: () => boolean;
}): Promise<AsyncIterableIterator<TMappedValue>> => {
  let pendingRead: Promise<IteratorResult<TValue>> | undefined =
    iterator.next();
  const pendingValues: TMappedValue[] = [];

  try {
    pendingValues.push(...(await readPrefix()));
  } catch (error) {
    await iterator.return?.();

    throw error;
  }

  const close = async (): Promise<IteratorResult<TMappedValue>> => {
    pendingValues.length = 0;
    await iterator.return?.();

    return { done: true, value: undefined };
  };

  return {
    next: async () => {
      while (pendingValues.length === 0) {
        if (isDone?.() === true) {
          return close();
        }

        const result = await (pendingRead ?? iterator.next());

        pendingRead = undefined;

        if (result.done === true) {
          return { done: true, value: undefined };
        }

        pendingValues.push(...(await mapValue(result.value)));
      }

      const [value] = pendingValues.splice(0, 1);

      return { done: false, value };
    },
    return: close,
    throw: async (error: unknown) => {
      if (isDefined(iterator.throw)) {
        await iterator.throw(error);
      }

      throw error;
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
};
