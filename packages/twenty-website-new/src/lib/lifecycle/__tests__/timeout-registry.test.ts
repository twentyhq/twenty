import { createTimeoutRegistry } from '../timeout-registry';

function createManualTimerScheduler() {
  let nextHandle = 1;
  const callbacks = new Map<number, () => void>();

  return {
    callbacks,
    clearTimeout: jest.fn((handle: number) => {
      callbacks.delete(handle);
    }),
    run: (handle: number) => {
      callbacks.get(handle)?.();
    },
    setTimeout: jest.fn((callback: () => void) => {
      const handle = nextHandle;
      nextHandle += 1;
      callbacks.set(handle, callback);
      return handle;
    }),
  };
}

describe('createTimeoutRegistry', () => {
  it('tracks and runs scheduled callbacks once', () => {
    const scheduler = createManualTimerScheduler();
    const registry = createTimeoutRegistry(scheduler);
    const callback = jest.fn();

    registry.schedule(callback, 200);

    expect(registry.pendingCount()).toBe(1);
    scheduler.run(1);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(registry.pendingCount()).toBe(0);
  });

  it('cancels one scheduled callback without clearing unrelated callbacks', () => {
    const scheduler = createManualTimerScheduler();
    const registry = createTimeoutRegistry(scheduler);
    const firstCallback = jest.fn();
    const secondCallback = jest.fn();

    const cancelFirst = registry.schedule(firstCallback, 200);
    registry.schedule(secondCallback, 300);

    cancelFirst();

    expect(scheduler.clearTimeout).toHaveBeenCalledWith(1);
    expect(registry.pendingCount()).toBe(1);

    scheduler.run(1);
    scheduler.run(2);

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledTimes(1);
    expect(registry.pendingCount()).toBe(0);
  });

  it('clears every pending timeout', () => {
    const scheduler = createManualTimerScheduler();
    const registry = createTimeoutRegistry(scheduler);

    registry.schedule(jest.fn(), 200);
    registry.schedule(jest.fn(), 300);
    registry.clearAll();

    expect(scheduler.clearTimeout).toHaveBeenCalledWith(1);
    expect(scheduler.clearTimeout).toHaveBeenCalledWith(2);
    expect(registry.pendingCount()).toBe(0);
  });
});
