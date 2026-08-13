import { createConcurrencyLimiter } from 'src/modules/messaging/message-import-manager/drivers/utils/create-concurrency-limiter.util';

const createDeferred = <T>() => {
  let resolve: (value: T | PromiseLike<T>) => void;
  let reject: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve: resolve!, reject: reject! };
};

describe('createConcurrencyLimiter', () => {
  it('should cap concurrent tasks at the configured maximum', async () => {
    const limitConcurrency = createConcurrencyLimiter(4);
    const taskStartedDeferreds = Array.from({ length: 12 }, () =>
      createDeferred<void>(),
    );
    const taskFinishedDeferreds = Array.from({ length: 12 }, () =>
      createDeferred<void>(),
    );
    let activeTaskCount = 0;
    let maximumActiveTaskCount = 0;

    const tasks = Array.from({ length: 12 }, (_, taskIndex) =>
      limitConcurrency(async () => {
        activeTaskCount++;
        maximumActiveTaskCount = Math.max(
          maximumActiveTaskCount,
          activeTaskCount,
        );
        taskStartedDeferreds[taskIndex].resolve();

        await taskFinishedDeferreds[taskIndex].promise;

        activeTaskCount--;

        return taskIndex;
      }),
    );

    await Promise.all(
      taskStartedDeferreds.slice(0, 4).map(({ promise }) => promise),
    );
    expect(activeTaskCount).toBe(4);

    for (let taskIndex = 0; taskIndex < 12; taskIndex++) {
      await taskStartedDeferreds[taskIndex].promise;
      taskFinishedDeferreds[taskIndex].resolve();
    }

    await expect(Promise.all(tasks)).resolves.toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    ]);
    expect(maximumActiveTaskCount).toBe(4);
  });

  it('should release capacity after a task rejects, so later tasks still run', async () => {
    const limitConcurrency = createConcurrencyLimiter(1);
    const rejectedTask = limitConcurrency(async () => {
      throw new Error('Gmail batch request failed');
    });
    const nextTask = limitConcurrency(async () => 'completed');

    await expect(rejectedTask).rejects.toThrow('Gmail batch request failed');
    await expect(nextTask).resolves.toBe('completed');
  });

  it('should reject invalid concurrency values', () => {
    expect(() => createConcurrencyLimiter(0)).toThrow(
      'Maximum concurrency must be a positive integer',
    );
    expect(() => createConcurrencyLimiter(-1)).toThrow(
      'Maximum concurrency must be a positive integer',
    );
    expect(() => createConcurrencyLimiter(1.5)).toThrow(
      'Maximum concurrency must be a positive integer',
    );
  });
});
