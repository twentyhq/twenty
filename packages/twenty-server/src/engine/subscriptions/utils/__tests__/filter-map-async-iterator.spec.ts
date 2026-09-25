import { filterMapAsyncIterator } from 'src/engine/subscriptions/utils/filter-map-async-iterator';

describe('filterMapAsyncIterator', () => {
  it('maps source values and skips the ones mapped to undefined', async () => {
    const stream = filterMapAsyncIterator<number>(
      (async function* () {
        yield 1;
        yield 2;
        yield 3;
      })(),
      (value) => (value === 2 ? undefined : value * 10),
    );
    const values = [];

    for await (const value of stream) {
      values.push(value);
    }

    expect(values).toEqual([10, 30]);
  });

  it('closes the source while a read is pending', async () => {
    const sourceReturn = jest
      .fn()
      .mockResolvedValue({ done: true, value: undefined });
    const stream = filterMapAsyncIterator<number>(
      {
        next: () => new Promise(() => {}),
        return: sourceReturn,
      },
      (value) => value,
    );

    void stream.next();

    await expect(stream.return?.()).resolves.toEqual({
      done: true,
      value: undefined,
    });
    expect(sourceReturn).toHaveBeenCalledTimes(1);
  });
});
