import { createVisualMountScheduler } from '../utils/visual-mount-scheduler';

function createManualIdleHost() {
  let nextHandle = 1;
  const callbacks = new Map<
    number,
    {
      callback: IdleRequestCallback;
      options?: IdleRequestOptions;
    }
  >();

  return {
    callbacks,
    cancelIdleCallback: jest.fn((handle: number) => {
      callbacks.delete(handle);
    }),
    requestIdleCallback: jest.fn(
      (callback: IdleRequestCallback, options?: IdleRequestOptions) => {
        const handle = nextHandle;
        nextHandle += 1;
        callbacks.set(handle, { callback, options });

        return handle;
      },
    ),
    runIdle: (handle: number) => {
      const task = callbacks.get(handle);
      callbacks.delete(handle);
      task?.callback({
        didTimeout: false,
        timeRemaining: () => 50,
      });
    },
  };
}

describe('createVisualMountScheduler', () => {
  it('runs scheduled visual mounts during idle time', () => {
    const host = createManualIdleHost();
    const scheduler = createVisualMountScheduler(host);
    const callback = jest.fn();

    scheduler.schedule(callback);

    expect(callback).not.toHaveBeenCalled();
    expect(host.requestIdleCallback).toHaveBeenCalledWith(
      expect.any(Function),
      { timeout: 80 },
    );

    host.runIdle(1);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('cancels pending visual mounts before they run', () => {
    const host = createManualIdleHost();
    const scheduler = createVisualMountScheduler(host);
    const callback = jest.fn();

    const cancel = scheduler.schedule(callback);
    cancel();

    host.runIdle(1);

    expect(host.cancelIdleCallback).toHaveBeenCalledWith(1);
    expect(callback).not.toHaveBeenCalled();
  });

  it('processes one visual mount per idle slot', () => {
    const host = createManualIdleHost();
    const scheduler = createVisualMountScheduler(host);
    const firstCallback = jest.fn();
    const secondCallback = jest.fn();

    scheduler.schedule(firstCallback);
    scheduler.schedule(secondCallback);

    expect(host.requestIdleCallback).toHaveBeenCalledTimes(1);

    host.runIdle(1);

    expect(firstCallback).toHaveBeenCalledTimes(1);
    expect(secondCallback).not.toHaveBeenCalled();
    expect(host.requestIdleCallback).toHaveBeenCalledTimes(2);

    host.runIdle(2);

    expect(secondCallback).toHaveBeenCalledTimes(1);
  });

  it('moves priority visual mounts ahead of normal visual mounts', () => {
    const host = createManualIdleHost();
    const scheduler = createVisualMountScheduler(host);
    const calls: string[] = [];

    scheduler.schedule(() => calls.push('normal'));
    scheduler.schedule(() => calls.push('priority'), { priority: 'priority' });

    expect(host.cancelIdleCallback).toHaveBeenCalledWith(1);
    expect(host.requestIdleCallback).toHaveBeenLastCalledWith(
      expect.any(Function),
      { timeout: 0 },
    );

    host.runIdle(2);
    host.runIdle(3);

    expect(calls).toEqual(['priority', 'normal']);
  });
});
