import { isDefined } from 'twenty-shared/utils';

// reads the source before the prefix, so a value published while the prefix loads is kept
export const flatMapAsyncIterator = <TValue, TMappedValue>({
  iterator,
  mapValue,
  readPrefix,
}: {
  iterator: AsyncIterator<TValue>;
  mapValue: (value: TValue) => Promise<TMappedValue[]>;
  readPrefix?: () => Promise<TMappedValue[]>;
}): AsyncIterableIterator<TMappedValue> => {
  const pendingValues: TMappedValue[] = [];
  let pendingRead: Promise<IteratorResult<TValue>> | undefined;
  let isStarted = false;

  return {
    next: async () => {
      if (!isStarted) {
        isStarted = true;
        pendingRead = iterator.next();
        pendingValues.push(...((await readPrefix?.()) ?? []));
      }

      while (pendingValues.length === 0) {
        const result = await (pendingRead ?? iterator.next());

        pendingRead = undefined;

        if (result.done) {
          return { done: true, value: undefined };
        }

        pendingValues.push(...(await mapValue(result.value)));
      }

      const [value] = pendingValues.splice(0, 1);

      return { done: false, value };
    },
    return: async () => {
      pendingValues.length = 0;
      await iterator.return?.();

      return { done: true, value: undefined };
    },
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
