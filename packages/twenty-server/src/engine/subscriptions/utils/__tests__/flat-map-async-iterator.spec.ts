import { flatMapAsyncIterator } from 'src/engine/subscriptions/utils/flat-map-async-iterator';

describe('flatMapAsyncIterator', () => {
  it('yields the prefix, then each source value mapped to zero or more values', async () => {
    const stream = flatMapAsyncIterator<number, string>({
      iterator: (async function* () {
        yield 1;
        yield 2;
        yield 3;
      })(),
      mapValue: async (value) =>
        value === 2 ? [] : [`${value}a`, `${value}b`],
      readPrefix: async () => ['prefix'],
    });
    const values = [];

    for await (const value of stream) {
      values.push(value);
    }

    expect(values).toEqual(['prefix', '1a', '1b', '3a', '3b']);
  });

  it('reads from the source before reading the prefix', async () => {
    const calls: string[] = [];
    const stream = flatMapAsyncIterator<number, number>({
      iterator: {
        next: async () => {
          calls.push('source');

          return { done: true, value: undefined };
        },
      },
      mapValue: async (value) => [value],
      readPrefix: async () => {
        calls.push('prefix');

        return [];
      },
    });

    await stream.next();

    expect(calls).toEqual(['source', 'prefix']);
  });

  it('closes the source while a read is pending', async () => {
    const sourceReturn = jest
      .fn()
      .mockResolvedValue({ done: true, value: undefined });
    const stream = flatMapAsyncIterator<number, number>({
      iterator: {
        next: () => new Promise(() => {}),
        return: sourceReturn,
      },
      mapValue: async (value) => [value],
    });

    void stream.next();

    await expect(stream.return?.()).resolves.toEqual({
      done: true,
      value: undefined,
    });
    expect(sourceReturn).toHaveBeenCalledTimes(1);
  });
});
