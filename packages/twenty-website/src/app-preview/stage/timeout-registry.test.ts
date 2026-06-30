import { createTimeoutRegistry } from './timeout-registry';

describe('createTimeoutRegistry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should track and run scheduled callbacks once', () => {
    const registry = createTimeoutRegistry();
    const callback = jest.fn();

    registry.schedule(callback, 200);

    expect(registry.pendingCount()).toBe(1);
    jest.advanceTimersByTime(200);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(registry.pendingCount()).toBe(0);
  });

  it('should cancel one scheduled callback without clearing unrelated callbacks', () => {
    const registry = createTimeoutRegistry();
    const firstCallback = jest.fn();
    const secondCallback = jest.fn();

    const cancelFirst = registry.schedule(firstCallback, 200);
    registry.schedule(secondCallback, 300);

    cancelFirst();

    expect(registry.pendingCount()).toBe(1);

    jest.advanceTimersByTime(300);

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledTimes(1);
    expect(registry.pendingCount()).toBe(0);
  });

  it('should ignore double-cancels after the callback already ran', () => {
    const registry = createTimeoutRegistry();
    const callback = jest.fn();

    const cancel = registry.schedule(callback, 100);
    jest.advanceTimersByTime(100);
    cancel();
    cancel();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(registry.pendingCount()).toBe(0);
  });

  it('should clear every pending timeout', () => {
    const registry = createTimeoutRegistry();
    const firstCallback = jest.fn();
    const secondCallback = jest.fn();

    registry.schedule(firstCallback, 200);
    registry.schedule(secondCallback, 300);
    registry.clearAll();

    expect(registry.pendingCount()).toBe(0);

    jest.advanceTimersByTime(500);

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).not.toHaveBeenCalled();
  });
});
