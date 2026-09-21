import { PubSub } from 'graphql-subscriptions';
import { EventEmitter } from 'node:events';
import { setTimeout } from 'node:timers/promises';

import { wrapAsyncIteratorWithLifecycle } from 'src/engine/subscriptions/utils/wrap-async-iterator-with-lifecycle';

describe('wrapAsyncIteratorWithLifecycle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    expect(jest.getTimerCount()).toBe(0);
    jest.useRealTimers();
  });

  it('yields the initial value and source events, then cleans up once', async () => {
    const onCleanup = jest.fn();
    const stream = wrapAsyncIteratorWithLifecycle(
      async function* () {
        yield 1;
        yield 2;
      },
      { initialValue: 0, onCleanup },
    );
    const values = [];

    for await (const value of stream) {
      values.push(value);
    }
    await stream.return?.();

    expect(values).toEqual([0, 1, 2]);
    expect(onCleanup).toHaveBeenCalledTimes(1);
    await expect(stream.next()).resolves.toEqual({
      done: true,
      value: undefined,
    });
  });

  it('preserves a source error and cleans up once', async () => {
    const error = new Error('Source unavailable');
    const onCleanup = jest.fn();
    const stream = wrapAsyncIteratorWithLifecycle(
      async function* () {
        yield 1;
        throw error;
      },
      { onCleanup },
    );

    await stream.next();
    await expect(stream.next()).rejects.toBe(error);
    await stream.return?.();
    expect(onCleanup).toHaveBeenCalledTimes(1);
  });

  it('cleans up a subscription closed before its first read', async () => {
    const onCleanup = jest.fn();
    const onRead = jest.fn();
    const stream = wrapAsyncIteratorWithLifecycle(
      async function* () {
        onRead();
        yield 1;
      },
      { onCleanup },
    );

    await Promise.all([stream.return?.(), stream.return?.()]);
    await expect(stream.next()).resolves.toEqual({
      done: true,
      value: undefined,
    });
    expect(onRead).not.toHaveBeenCalled();
    expect(onCleanup).toHaveBeenCalledTimes(1);
  });

  it.each(['return', 'throw'] as const)(
    'aborts a pending read before closing the generator through %s',
    async (operation) => {
      const onCleanup = jest.fn();
      const onFinally = jest.fn();
      const error = new Error('Disconnected');
      const stream = wrapAsyncIteratorWithLifecycle(
        async function* (signal) {
          try {
            await setTimeout(60_000, undefined, { signal });
            yield 1;
          } finally {
            onFinally();
          }
        },
        { onCleanup },
      );
      const pending = stream.next();

      if (operation === 'throw') {
        await expect(stream.throw?.(error)).rejects.toBe(error);
      } else {
        await stream.return?.();
      }
      await expect(pending).resolves.toEqual({ done: true, value: undefined });
      expect(onFinally).toHaveBeenCalledTimes(1);
      expect(onCleanup).toHaveBeenCalledTimes(1);
    },
  );

  it('keeps the first-read heartbeat running while event consumption is paused', async () => {
    const onHeartbeat = jest.fn().mockResolvedValue(true);
    const stream = wrapAsyncIteratorWithLifecycle(
      async function* () {
        yield 1;
      },
      { initialValue: 0, onHeartbeat, heartbeatIntervalMs: 1000 },
    );

    await jest.advanceTimersByTimeAsync(2000);
    expect(onHeartbeat).not.toHaveBeenCalled();
    await stream.next();
    await jest.advanceTimersByTimeAsync(2000);
    expect(onHeartbeat).toHaveBeenCalledTimes(2);
    await stream.return?.();
    await stream.next();
    await jest.advanceTimersByTimeAsync(2000);
    expect(onHeartbeat).toHaveBeenCalledTimes(2);
  });

  it('publishes heartbeats through PubSub and releases a pending subscription on disconnect', async () => {
    const eventEmitter = new EventEmitter();
    const pubSub = new PubSub({ eventEmitter });
    const iterator = pubSub.asyncIterator<number>(
      'updates',
    ) as AsyncIterableIterator<number>;
    const onCleanup = jest.fn();
    const stream = wrapAsyncIteratorWithLifecycle(() => iterator, {
      initialValue: 0,
      onHeartbeat: async () => {
        await pubSub.publish('updates', 1);
        return true;
      },
      heartbeatIntervalMs: 1000,
      onCleanup,
    });
    await expect(stream.next()).resolves.toEqual({ done: false, value: 0 });
    const heartbeat = stream.next();
    await jest.advanceTimersByTimeAsync(1000);
    await expect(heartbeat).resolves.toEqual({ done: false, value: 1 });
    const pending = stream.next();

    await stream.return?.();

    await expect(pending).resolves.toEqual({ done: true, value: undefined });
    expect(eventEmitter.listenerCount('updates')).toBe(0);
    expect(onCleanup).toHaveBeenCalledTimes(1);
  });

  it('starts immediate heartbeats before any events are read', async () => {
    const onHeartbeat = jest.fn().mockResolvedValue(true);
    const stream = wrapAsyncIteratorWithLifecycle(
      async function* () {
        yield 1;
      },
      { onHeartbeat, heartbeatIntervalMs: 1000, heartbeatStart: 'immediate' },
    );

    await jest.advanceTimersByTimeAsync(2000);
    expect(onHeartbeat).toHaveBeenCalledTimes(2);
    await stream.return?.();
  });

  it('does not overlap heartbeats or restart them after the callback stops renewal', async () => {
    let finishHeartbeat = (_shouldContinue: boolean) => {};
    const heartbeat = new Promise<boolean>((resolve) => {
      finishHeartbeat = resolve;
    });
    const onHeartbeat = jest.fn().mockReturnValue(heartbeat);
    const stream = wrapAsyncIteratorWithLifecycle(
      async function* () {
        yield 1;
      },
      { onHeartbeat, heartbeatIntervalMs: 1000, heartbeatStart: 'immediate' },
    );

    await jest.advanceTimersByTimeAsync(3000);
    expect(onHeartbeat).toHaveBeenCalledTimes(1);
    finishHeartbeat(false);
    await jest.advanceTimersByTimeAsync(3000);
    await stream.next();
    await jest.advanceTimersByTimeAsync(3000);
    expect(onHeartbeat).toHaveBeenCalledTimes(1);
    await stream.return?.();
  });

  it('continues after a best-effort heartbeat failure', async () => {
    const onHeartbeat = jest
      .fn()
      .mockRejectedValueOnce(new Error('Redis unavailable'))
      .mockResolvedValue(true);
    const onCleanup = jest.fn();
    const stream = wrapAsyncIteratorWithLifecycle(
      async function* () {
        yield 1;
      },
      {
        onHeartbeat,
        onCleanup,
        heartbeatIntervalMs: 1000,
        heartbeatStart: 'immediate',
      },
    );

    await jest.advanceTimersByTimeAsync(2000);
    expect(onHeartbeat).toHaveBeenCalledTimes(2);
    expect(onCleanup).not.toHaveBeenCalled();
    await expect(stream.next()).resolves.toEqual({ done: false, value: 1 });
    await stream.return?.();
  });

  it.each([false, true])(
    'closes and reports a fatal heartbeat error with a pending read: %s',
    async (hasPendingRead) => {
      const error = new Error('Export lease lost');
      const onCleanup = jest.fn();
      const stream = wrapAsyncIteratorWithLifecycle(
        async function* (signal) {
          await setTimeout(60_000, undefined, { signal });
          yield 1;
        },
        {
          onHeartbeat: jest.fn().mockRejectedValue(error),
          onCleanup,
          heartbeatIntervalMs: 1000,
          heartbeatStart: 'immediate',
          heartbeatErrorBehavior: 'close',
        },
      );
      const pending = hasPendingRead
        ? expect(stream.next()).rejects.toBe(error)
        : undefined;

      await jest.advanceTimersByTimeAsync(1000);
      await pending;
      await expect(stream.next()).rejects.toBe(error);
      await stream.return?.();
      expect(onCleanup).toHaveBeenCalledTimes(1);
    },
  );

  it('finishes an in-flight heartbeat before releasing resources', async () => {
    let finishHeartbeat = (_shouldContinue: boolean) => {};
    const heartbeat = new Promise<boolean>((resolve) => {
      finishHeartbeat = resolve;
    });
    const onCleanup = jest.fn();
    const stream = wrapAsyncIteratorWithLifecycle(
      async function* () {
        yield 1;
      },
      {
        onHeartbeat: () => heartbeat,
        onCleanup,
        heartbeatIntervalMs: 1000,
        heartbeatStart: 'immediate',
      },
    );

    await jest.advanceTimersByTimeAsync(1000);
    const closing = stream.return?.();
    await Promise.resolve();
    expect(onCleanup).not.toHaveBeenCalled();
    finishHeartbeat(true);
    await closing;
    expect(onCleanup).toHaveBeenCalledTimes(1);
  });

  it.each([false, true])(
    'closes the source even when cleanup fails, with an error handler: %s',
    async (hasErrorHandler) => {
      const error = new Error('Cleanup failed');
      const onCleanup = jest.fn().mockRejectedValue(error);
      const onCleanupError = jest.fn();
      const onFinally = jest.fn();
      const stream = wrapAsyncIteratorWithLifecycle(
        async function* () {
          try {
            yield 1;
          } finally {
            onFinally();
          }
        },
        {
          onCleanup,
          onCleanupError: hasErrorHandler ? onCleanupError : undefined,
        },
      );
      await stream.next();

      if (hasErrorHandler) {
        await expect(stream.return?.()).resolves.toEqual({
          done: true,
          value: undefined,
        });
        expect(onCleanupError).toHaveBeenCalledWith(error);
      } else {
        await expect(stream.return?.()).rejects.toBe(error);
      }
      expect(onFinally).toHaveBeenCalledTimes(1);
      expect(onCleanup).toHaveBeenCalledTimes(1);
    },
  );
});
