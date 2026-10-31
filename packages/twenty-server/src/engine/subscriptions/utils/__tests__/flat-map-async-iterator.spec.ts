import { flatMapAsyncIterator } from 'src/engine/subscriptions/utils/flat-map-async-iterator';

const collect = async <TValue>(iterator: AsyncIterableIterator<TValue>) => {
  const values: TValue[] = [];

  for await (const value of iterator) {
    values.push(value);
  }

  return values;
};

describe('flatMapAsyncIterator', () => {
  it('yields the prefix, then each source value mapped to zero or more values', async () => {
    const iterator = await flatMapAsyncIterator<number, string>({
      iterator: (async function* () {
        yield 1;
        yield 2;
        yield 3;
      })(),
      readPrefix: async () => ['prefix'],
      mapValue: async (value) =>
        value === 2 ? [] : [`${value}a`, `${value}b`],
    });

    expect(await collect(iterator)).toEqual(['prefix', '1a', '1b', '3a', '3b']);
  });

  it('reads from the source before reading the prefix', async () => {
    const calls: string[] = [];

    await flatMapAsyncIterator<number, number>({
      iterator: {
        next: async () => {
          calls.push('source');

          return { done: true, value: undefined };
        },
      },
      readPrefix: async () => {
        calls.push('prefix');

        return [];
      },
      mapValue: async (value) => [value],
    });

    expect(calls).toEqual(['source', 'prefix']);
  });

  it('closes the source once done, after handing out what it read', async () => {
    const sourceReturn = jest
      .fn()
      .mockResolvedValue({ done: true, value: undefined });
    let isDone = false;
    const iterator = await flatMapAsyncIterator<number, string>({
      iterator: { next: () => new Promise(() => {}), return: sourceReturn },
      readPrefix: async () => {
        isDone = true;

        return ['end'];
      },
      mapValue: async () => [],
      isDone: () => isDone,
    });

    expect(await collect(iterator)).toEqual(['end']);
    expect(sourceReturn).toHaveBeenCalledTimes(1);
  });

  it('closes the source when the prefix fails', async () => {
    const sourceReturn = jest
      .fn()
      .mockResolvedValue({ done: true, value: undefined });

    await expect(
      flatMapAsyncIterator<number, number>({
        iterator: { next: () => new Promise(() => {}), return: sourceReturn },
        readPrefix: async () => {
          throw new Error('unknown cursor');
        },
        mapValue: async (value) => [value],
      }),
    ).rejects.toThrow('unknown cursor');
    expect(sourceReturn).toHaveBeenCalledTimes(1);
  });
});
