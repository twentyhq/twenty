import { withAsyncIteratorAuthorization } from 'src/engine/subscriptions/utils/with-async-iterator-authorization';

const createSource = () => {
  const source: AsyncIterableIterator<string> = {
    next: jest
      .fn()
      .mockResolvedValue({ done: false, value: 'private content' }),
    return: jest.fn().mockResolvedValue({ done: true, value: undefined }),
    [Symbol.asyncIterator]() {
      return this;
    },
  };
  return source;
};

describe('Subscription authorization', () => {
  it('checks every event and closes without yielding content after revocation', async () => {
    const source = createSource();
    const authorize = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValue(new Error('revoked'));
    const iterator = withAsyncIteratorAuthorization({
      iterator: source,
      authorize,
    });
    await expect(iterator.next()).resolves.toEqual({
      done: false,
      value: 'private content',
    });
    await expect(iterator.next()).rejects.toThrow('revoked');
    expect(source.return).toHaveBeenCalled();
  });

  it('checks access after a pending event arrives', async () => {
    const source = createSource();
    let deliver: (value: IteratorResult<string>) => void = () => {};
    source.next = jest.fn().mockReturnValue(
      new Promise<IteratorResult<string>>((resolve) => {
        deliver = resolve;
      }),
    );
    const authorize = jest.fn().mockResolvedValue(undefined);
    const iterator = withAsyncIteratorAuthorization({
      iterator: source,
      authorize,
    });
    const pending = iterator.next();
    expect(authorize).not.toHaveBeenCalled();
    authorize.mockRejectedValue(new Error('revoked while waiting'));
    deliver({ done: false, value: 'must not escape' });
    await expect(pending).rejects.toThrow('revoked while waiting');
  });

  it('fails closed on an authorization backend error', async () => {
    const source = createSource();
    const iterator = withAsyncIteratorAuthorization({
      iterator: source,
      authorize: async () => {
        throw new Error('database unavailable');
      },
    });
    await expect(iterator.next()).rejects.toThrow('database unavailable');
    expect(source.return).toHaveBeenCalledTimes(1);
  });

  it.each([false, true])(
    'preserves access denial when cleanup fails synchronously=%s',
    async (synchronous) => {
      const source = createSource();
      const denial = new Error('access revoked');
      source.return = synchronous
        ? jest.fn(() => {
            throw new Error('cleanup failed');
          })
        : jest.fn().mockRejectedValue(new Error('cleanup failed'));
      const iterator = withAsyncIteratorAuthorization({
        iterator: source,
        authorize: jest.fn().mockRejectedValue(denial),
      });
      await expect(iterator.next()).rejects.toBe(denial);
      await expect(iterator.throw?.(denial)).rejects.toBe(denial);
    },
  );

  it('releases the underlying subscription when the client disconnects', async () => {
    const source = createSource();
    const iterator = withAsyncIteratorAuthorization({
      iterator: source,
      authorize: jest.fn(),
    });
    await iterator.return?.();
    expect(source.return).toHaveBeenCalledTimes(1);
  });
});
