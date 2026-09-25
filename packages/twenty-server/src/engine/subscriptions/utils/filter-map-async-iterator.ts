import { isDefined } from 'twenty-shared/utils';

// Not an async generator: its return() would wait for the pending next(), so a
// closed subscription would keep its pub/sub listener until the next message.
export const filterMapAsyncIterator = <TValue>(
  iterator: AsyncIterator<TValue>,
  mapValue: (value: TValue) => TValue | undefined,
): AsyncIterableIterator<TValue> => ({
  next: async () => {
    while (true) {
      const result = await iterator.next();

      if (result.done === true) {
        return result;
      }

      const mappedValue = mapValue(result.value);

      if (isDefined(mappedValue)) {
        return { done: false, value: mappedValue };
      }
    }
  },
  return: async () =>
    (await iterator.return?.()) ?? { done: true, value: undefined },
  throw: async (error: unknown) => {
    if (isDefined(iterator.throw)) {
      return iterator.throw(error);
    }

    throw error;
  },
  [Symbol.asyncIterator]() {
    return this;
  },
});
