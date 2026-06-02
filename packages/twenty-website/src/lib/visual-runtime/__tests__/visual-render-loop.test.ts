import {
  createVisualRenderLoop,
  type VisualRenderLoopDocument,
} from '../utils/visual-render-loop';

function createAnimationFrameScheduler() {
  let nextHandle = 1;
  const callbacks = new Map<number, FrameRequestCallback>();

  return {
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

function createDocumentVisibilityStub(initialHidden = false) {
  const listeners = new Set<EventListenerOrEventListenerObject>();
  const documentStub: VisualRenderLoopDocument = {
    addEventListener: jest.fn((_type, listener) => {
      listeners.add(listener);
    }),
    hidden: initialHidden,
    removeEventListener: jest.fn((_type, listener) => {
      listeners.delete(listener);
    }),
  };

  return {
    documentStub,
    setHidden: (hidden: boolean) => {
      documentStub.hidden = hidden;
      listeners.forEach((listener) => {
        if (typeof listener === 'function') {
          listener(new Event('visibilitychange'));
          return;
        }

        listener.handleEvent(new Event('visibilitychange'));
      });
    },
  };
}

describe('createVisualRenderLoop', () => {
  it('schedules one frame at a time', () => {
    const scheduler = createAnimationFrameScheduler();
    const loop = createVisualRenderLoop({
      cancelAnimationFrame: scheduler.cancelAnimationFrame,
      document: null,
      renderFrame: jest.fn(),
      requestAnimationFrame: scheduler.requestAnimationFrame,
    });

    loop.start();
    loop.start();

    expect(scheduler.requestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  it('continues scheduling after each rendered frame', () => {
    const scheduler = createAnimationFrameScheduler();
    const renderFrame = jest.fn();
    const loop = createVisualRenderLoop({
      cancelAnimationFrame: scheduler.cancelAnimationFrame,
      document: null,
      renderFrame,
      requestAnimationFrame: scheduler.requestAnimationFrame,
    });

    loop.start();
    scheduler.runFrame(1, 16);

    expect(renderFrame).toHaveBeenCalledWith(16, {
      deltaSeconds: 0,
      elapsedSeconds: 0,
      timestamp: 16,
    });
    expect(scheduler.requestAnimationFrame).toHaveBeenCalledTimes(2);

    scheduler.runFrame(2, 32);

    expect(renderFrame).toHaveBeenLastCalledWith(32, {
      deltaSeconds: 0.016,
      elapsedSeconds: 0.016,
      timestamp: 32,
    });
  });

  it('stops until explicitly restarted when a frame returns false', () => {
    const scheduler = createAnimationFrameScheduler();
    const renderFrame = jest.fn(() => false);
    const loop = createVisualRenderLoop({
      cancelAnimationFrame: scheduler.cancelAnimationFrame,
      document: null,
      renderFrame,
      requestAnimationFrame: scheduler.requestAnimationFrame,
    });

    loop.start();
    scheduler.runFrame(1, 16);

    expect(renderFrame).toHaveBeenCalledWith(16, {
      deltaSeconds: 0,
      elapsedSeconds: 0,
      timestamp: 16,
    });
    expect(loop.isRunning()).toBe(false);
    expect(scheduler.requestAnimationFrame).toHaveBeenCalledTimes(1);

    loop.start();

    expect(scheduler.requestAnimationFrame).toHaveBeenCalledTimes(2);
  });

  it('does not reschedule when stopped during a frame callback', () => {
    const scheduler = createAnimationFrameScheduler();
    let loop: ReturnType<typeof createVisualRenderLoop>;
    const renderFrame = jest.fn(() => {
      loop.stop();
    });
    loop = createVisualRenderLoop({
      cancelAnimationFrame: scheduler.cancelAnimationFrame,
      document: null,
      renderFrame,
      requestAnimationFrame: scheduler.requestAnimationFrame,
    });

    loop.start();
    scheduler.runFrame(1, 16);

    expect(renderFrame).toHaveBeenCalledTimes(1);
    expect(loop.isRunning()).toBe(false);
    expect(scheduler.requestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  it('pauses and resumes with document visibility', () => {
    const scheduler = createAnimationFrameScheduler();
    const { documentStub, setHidden } = createDocumentVisibilityStub();
    const loop = createVisualRenderLoop({
      cancelAnimationFrame: scheduler.cancelAnimationFrame,
      document: documentStub,
      renderFrame: jest.fn(),
      requestAnimationFrame: scheduler.requestAnimationFrame,
    });

    loop.start();
    setHidden(true);

    expect(scheduler.cancelAnimationFrame).toHaveBeenCalledWith(1);
    expect(loop.isRunning()).toBe(false);

    setHidden(false);

    expect(scheduler.requestAnimationFrame).toHaveBeenCalledTimes(2);
  });

  it('pauses and resumes with target visibility', () => {
    const scheduler = createAnimationFrameScheduler();
    const targetVisibilityController: {
      update: ((isVisible: boolean) => void) | null;
    } = { update: null };
    const loop = createVisualRenderLoop({
      cancelAnimationFrame: scheduler.cancelAnimationFrame,
      document: null,
      renderFrame: jest.fn(),
      requestAnimationFrame: scheduler.requestAnimationFrame,
      target: {} as Element,
      visibilityObserver: (_target, onVisibilityChange) => {
        targetVisibilityController.update = onVisibilityChange;

        return jest.fn();
      },
    });

    loop.start();
    const updateTargetVisibility = targetVisibilityController.update;

    if (!updateTargetVisibility) {
      throw new Error('Target visibility observer was not registered');
    }

    updateTargetVisibility(false);

    expect(scheduler.cancelAnimationFrame).toHaveBeenCalledWith(1);
    expect(loop.isRunning()).toBe(false);

    updateTargetVisibility(true);

    expect(scheduler.requestAnimationFrame).toHaveBeenCalledTimes(2);
  });

  it('contains render errors and stops the loop', () => {
    const scheduler = createAnimationFrameScheduler();
    const error = new Error('frame failed');
    const onFrameError = jest.fn();
    const loop = createVisualRenderLoop({
      cancelAnimationFrame: scheduler.cancelAnimationFrame,
      document: null,
      onFrameError,
      renderFrame: () => {
        throw error;
      },
      requestAnimationFrame: scheduler.requestAnimationFrame,
    });

    loop.start();
    scheduler.runFrame(1, 16);

    expect(onFrameError).toHaveBeenCalledWith(error);
    expect(loop.isRunning()).toBe(false);
    expect(scheduler.requestAnimationFrame).toHaveBeenCalledTimes(1);
  });
});
