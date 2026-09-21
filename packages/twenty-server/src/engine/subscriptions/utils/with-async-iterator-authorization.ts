// Authorize after waiting for the next event: a grant may be revoked while
// next() is blocked, including when the underlying transport buffered data.
export const withAsyncIteratorAuthorization = <TValue>(
  iterator: AsyncIterableIterator<TValue>,
  authorize: () => Promise<unknown>,
): AsyncIterableIterator<TValue> => ({
  async next() {
    try {
      const result = await iterator.next();
      if (!result.done) {
        await authorize();
      }
      return result;
    } catch (error) {
      await iterator.return?.();
      throw error;
    }
  },
  async return() {
    await iterator.return?.();
    return { done: true, value: undefined };
  },
  async throw(error: unknown) {
    await iterator.return?.();
    throw error;
  },
  [Symbol.asyncIterator]() {
    return this;
  },
});
