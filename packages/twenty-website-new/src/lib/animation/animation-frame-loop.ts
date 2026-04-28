export type AnimationFrameLoopController = {
  isRunning: () => boolean;
  start: () => void;
  stop: () => void;
};

export type CreateAnimationFrameLoopOptions = {
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

  const stop = () => {
    if (animationFrameId === null) {
      return;
    }

    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  };

  const start = () => {
    if (animationFrameId !== null) {
      return;
    }

    animationFrameId = requestAnimationFrame((timestamp) => {
      animationFrameId = null;

      if (onFrame(timestamp) === false) {
        return;
      }

      start();
    });
  };

  return {
    isRunning: () => animationFrameId !== null,
    start,
    stop,
  };
}
