import { createAnimationFrameLoop } from '@/lib/animation/animation-frame-loop';

function createAnimationFrameScheduler() {
  let nextHandle = 1;
  const callbacks = new Map<number, FrameRequestCallback>();

  return {
    callbacks,
    cancelAnimationFrame: jest.fn((handle: number) => {
      callbacks.delete(handle);
    }),
    requestAnimationFrame: jest.fn((callback: FrameRequestCallback) => {
      const handle = nextHandle;
      nextHandle += 1;
      callbacks.set(handle, callback);

      return handle;
    }),
    runFrame: (handle: number, timestamp = 0) => {
      const callback = callbacks.get(handle);
      callbacks.delete(handle);
      callback?.(timestamp);
    },
  };
}

describe('createAnimationFrameLoop', () => {
  it('does not schedule duplicate frames when started repeatedly', () => {
    const scheduler = createAnimationFrameScheduler();
    const loop = createAnimationFrameLoop({
      cancelAnimationFrame: scheduler.cancelAnimationFrame,
      onFrame: jest.fn(() => false),
      requestAnimationFrame: scheduler.requestAnimationFrame,
    });

    loop.start();
    loop.start();

    expect(scheduler.requestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  it('keeps scheduling while onFrame does not return false', () => {
    const scheduler = createAnimationFrameScheduler();
    const onFrame = jest
      .fn()
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(false);
    const loop = createAnimationFrameLoop({
      cancelAnimationFrame: scheduler.cancelAnimationFrame,
      onFrame,
      requestAnimationFrame: scheduler.requestAnimationFrame,
    });

    loop.start();
    scheduler.runFrame(1, 16);

    expect(onFrame).toHaveBeenCalledWith(16);
    expect(scheduler.requestAnimationFrame).toHaveBeenCalledTimes(2);

    scheduler.runFrame(2, 32);

    expect(onFrame).toHaveBeenCalledWith(32);
    expect(loop.isRunning()).toBe(false);
  });

  it('cancels the pending frame on stop', () => {
    const scheduler = createAnimationFrameScheduler();
    const loop = createAnimationFrameLoop({
      cancelAnimationFrame: scheduler.cancelAnimationFrame,
      onFrame: jest.fn(),
      requestAnimationFrame: scheduler.requestAnimationFrame,
    });

    loop.start();
    loop.stop();

    expect(scheduler.cancelAnimationFrame).toHaveBeenCalledWith(1);
    expect(loop.isRunning()).toBe(false);
  });

  it('does not reschedule when stopped during onFrame', () => {
    const scheduler = createAnimationFrameScheduler();
    let loop: ReturnType<typeof createAnimationFrameLoop>;
    const onFrame = jest.fn(() => {
      loop.stop();
    });

    loop = createAnimationFrameLoop({
      cancelAnimationFrame: scheduler.cancelAnimationFrame,
      onFrame,
      requestAnimationFrame: scheduler.requestAnimationFrame,
    });

    loop.start();
    scheduler.runFrame(1, 16);

    expect(onFrame).toHaveBeenCalledWith(16);
    expect(scheduler.requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(scheduler.callbacks.size).toBe(0);
    expect(loop.isRunning()).toBe(false);
  });
});
