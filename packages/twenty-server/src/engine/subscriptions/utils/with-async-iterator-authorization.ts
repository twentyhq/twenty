// Authorize after next() resolves: a grant may be revoked while it is blocked
export const withAsyncIteratorAuthorization = <TValue>({
  iterator,
  authorize,
}: {
  iterator: AsyncIterableIterator<TValue>;
  authorize: () => Promise<unknown>;
}): AsyncIterableIterator<TValue> => ({
  async next() {
    try {
      const result = await iterator.next();
      if (!result.done) {
        await authorize();
      }
      return result;
    } catch (error) {
      try {
        await iterator.return?.();
      } catch {
        // Transport cleanup must not hide the original access denial.
      }
      throw error;
    }
  },
  async return() {
    await iterator.return?.();
    return { done: true, value: undefined };
  },
  async throw(error: unknown) {
    try {
      await iterator.return?.();
    } catch {
      // Preserve the caller's failure even if transport cleanup also fails.
    }
    throw error;
  },
  [Symbol.asyncIterator]() {
    return this;
  },
});
