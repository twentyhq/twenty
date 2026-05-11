type AnimationFrameLoopController = {
  isRunning: () => boolean;
  start: () => void;
  stop: () => void;
};

type CreateAnimationFrameLoopOptions = {
  cancelAnimationFrame?: (handle: number) => void;
  onFrame: (timestamp: number) => boolean | void;
  requestAnimationFrame?: (callback: FrameRequestCallback) => number;
};

const requestAnimationFrameFromWindow = (callback: FrameRequestCallback) =>
  window.requestAnimationFrame(callback);

const cancelAnimationFrameFromWindow = (handle: number) =>
  window.cancelAnimationFrame(handle);

export function createAnimationFrameLoop({
  cancelAnimationFrame = cancelAnimationFrameFromWindow,
  onFrame,
  requestAnimationFrame = requestAnimationFrameFromWindow,
}: CreateAnimationFrameLoopOptions): AnimationFrameLoopController {
  let animationFrameId: number | null = null;
  let isLoopRunning = false;
  let runToken = 0;

  const stop = () => {
    if (!isLoopRunning && animationFrameId === null) {
      return;
    }

    isLoopRunning = false;
    runToken += 1;

    if (animationFrameId === null) {
      return;
    }

    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  };

  const scheduleNextFrame = (token: number) => {
    animationFrameId = requestAnimationFrame((timestamp) => {
      animationFrameId = null;

      if (!isLoopRunning || token !== runToken) {
        return;
      }

      if (onFrame(timestamp) === false) {
        if (token === runToken) {
          isLoopRunning = false;
        }

        return;
      }

      if (!isLoopRunning || token !== runToken) {
        return;
      }

      scheduleNextFrame(token);
    });
  };

  const start = () => {
    if (isLoopRunning) {
      return;
    }

    isLoopRunning = true;
    runToken += 1;
    scheduleNextFrame(runToken);
  };

  return {
    isRunning: () => isLoopRunning,
    start,
    stop,
  };
}
