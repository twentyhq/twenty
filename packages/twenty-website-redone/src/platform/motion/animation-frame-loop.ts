type AnimationFrameLoopController = {
  isRunning: () => boolean;
  start: () => void;
  stop: () => void;
};

type CreateAnimationFrameLoopOptions = {
  cancelAnimationFrame?: (handle: number) => void;
  // Return false to stop the loop after this frame.
  onFrame: (timestamp: number) => boolean | void;
  requestAnimationFrame?: (callback: FrameRequestCallback) => number;
};

const requestFrameFromWindow = (callback: FrameRequestCallback) =>
  window.requestAnimationFrame(callback);
const cancelFrameFromWindow = (handle: number) =>
  window.cancelAnimationFrame(handle);

// Token-guarded rAF loop: stop() invalidates in-flight frames, so a stale
// callback can never run after a restart.
export function createAnimationFrameLoop({
  cancelAnimationFrame = cancelFrameFromWindow,
  onFrame,
  requestAnimationFrame = requestFrameFromWindow,
}: CreateAnimationFrameLoopOptions): AnimationFrameLoopController {
  let animationFrameId: number | null = null;
  let isLoopRunning = false;
  let runToken = 0;

  const stop = () => {
    if (!isLoopRunning && animationFrameId === null) return;
    isLoopRunning = false;
    runToken += 1;
    if (animationFrameId === null) return;
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  };

  const scheduleNextFrame = (token: number) => {
    animationFrameId = requestAnimationFrame((timestamp) => {
      animationFrameId = null;
      if (!isLoopRunning || token !== runToken) return;
      if (onFrame(timestamp) === false) {
        if (token === runToken) isLoopRunning = false;
        return;
      }
      if (!isLoopRunning || token !== runToken) return;
      scheduleNextFrame(token);
    });
  };

  const start = () => {
    if (isLoopRunning) return;
    isLoopRunning = true;
    runToken += 1;
    scheduleNextFrame(runToken);
  };

  return { isRunning: () => isLoopRunning, start, stop };
}
