import { withDeadline } from 'src/utils/with-deadline';

describe('withDeadline', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should resolve with the promise value when it settles in time', async () => {
    const result = withDeadline({
      promise: Promise.resolve('done'),
      timeoutMs: 1000,
      createTimeoutError: () => new Error('too slow'),
    });

    await expect(result).resolves.toBe('done');
  });

  it('should reject with the timeout error when the deadline passes first', async () => {
    const result = withDeadline({
      promise: new Promise<never>(() => {}),
      timeoutMs: 1000,
      createTimeoutError: () => new Error('too slow'),
    });

    jest.advanceTimersByTime(1000);

    await expect(result).rejects.toThrow('too slow');
  });

  it('should propagate the promise rejection when it fails in time', async () => {
    const result = withDeadline({
      promise: Promise.reject(new Error('boom')),
      timeoutMs: 1000,
      createTimeoutError: () => new Error('too slow'),
    });

    await expect(result).rejects.toThrow('boom');
  });

  it('should report a settlement that happens after the deadline', async () => {
    const onSettleAfterDeadline = jest.fn();
    let resolveLate: (value: string) => void = () => {};
    const latePromise = new Promise<string>((resolve) => {
      resolveLate = resolve;
    });

    const result = withDeadline({
      promise: latePromise,
      timeoutMs: 1000,
      createTimeoutError: () => new Error('too slow'),
      onSettleAfterDeadline,
    });

    jest.advanceTimersByTime(1000);

    await expect(result).rejects.toThrow('too slow');

    resolveLate('late');
    await latePromise;

    expect(onSettleAfterDeadline).toHaveBeenCalledWith({ status: 'fulfilled' });
  });

  it('should not report a settlement that happens before the deadline', async () => {
    const onSettleAfterDeadline = jest.fn();

    await withDeadline({
      promise: Promise.resolve('done'),
      timeoutMs: 1000,
      createTimeoutError: () => new Error('too slow'),
      onSettleAfterDeadline,
    });

    expect(onSettleAfterDeadline).not.toHaveBeenCalled();
  });

  it('should clear the timer once the promise settles', async () => {
    await withDeadline({
      promise: Promise.resolve('done'),
      timeoutMs: 1000,
      createTimeoutError: () => new Error('too slow'),
    });

    expect(jest.getTimerCount()).toBe(0);
  });
});
