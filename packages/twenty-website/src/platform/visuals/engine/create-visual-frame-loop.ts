import { createAnimationFrameLoop } from '@/platform/motion';

import {
  observeElementVisibility,
  type ObserveElementVisibilityOptions,
} from './observe-element-visibility';
import { visualTestInstrumentation } from './visual-test-instrumentation';

export type VisualFrame = {
  deltaSeconds: number;
  elapsedSeconds: number;
  timestamp: DOMHighResTimeStamp;
};

export type VisualFrameLoop = {
  start: () => void;
  stop: () => void;
  dispose: () => void;
  isRunning: () => boolean;
};

type CreateVisualFrameLoopOptions = {
  renderFrame: (frame: VisualFrame) => boolean | void;
  onFrameError?: (error: unknown) => void;
  // Pause rendering while this element is outside its margin, even though
  // the scene stays mounted (VisualMount's mount margin is much wider).
  target?: Element | null;
  targetVisibilityOptions?: ObserveElementVisibilityOptions;
};

// A background tab can sleep for minutes; replaying that as one delta would
// teleport every animation. Clamp instead, and reset the baseline whenever
// rendering resumes so the first frame back is calm.
const MAX_FRAME_DELTA_SECONDS = 0.1;

const reportFrameErrorInDevelopment = (error: unknown) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Visual frame loop failed:', error);
  }
};

export function createVisualFrameLoop({
  renderFrame,
  onFrameError = reportFrameErrorInDevelopment,
  target = null,
  targetVisibilityOptions,
}: CreateVisualFrameLoopOptions): VisualFrameLoop {
  let disposed = false;
  let wantsRunning = false;
  let isDocumentVisible =
    typeof document === 'undefined' ? true : !document.hidden;
  let isTargetVisible = true;
  let firstFrameAt: DOMHighResTimeStamp | null = null;
  let previousFrameAt: DOMHighResTimeStamp | null = null;

  const loop = createAnimationFrameLoop({
    onFrame: (timestamp) => {
      visualTestInstrumentation.countFrameTick();

      if (firstFrameAt === null) {
        firstFrameAt = timestamp;
      }
      const rawDeltaSeconds =
        previousFrameAt === null ? 0 : (timestamp - previousFrameAt) / 1000;
      previousFrameAt = timestamp;

      const frame: VisualFrame = {
        deltaSeconds: Math.min(rawDeltaSeconds, MAX_FRAME_DELTA_SECONDS),
        elapsedSeconds: (timestamp - firstFrameAt) / 1000,
        timestamp,
      };

      try {
        return renderFrame(frame);
      } catch (error) {
        onFrameError(error);
        wantsRunning = false;
        return false;
      }
    },
  });

  const syncRunning = () => {
    const shouldRun =
      wantsRunning && !disposed && isDocumentVisible && isTargetVisible;

    if (shouldRun && !loop.isRunning()) {
      previousFrameAt = null;
      loop.start();
    } else if (!shouldRun && loop.isRunning()) {
      loop.stop();
    }
  };

  const handleVisibilityChange = () => {
    isDocumentVisible = !document.hidden;
    syncRunning();
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  const unobserveTarget =
    target === null
      ? null
      : observeElementVisibility(
          target,
          (isVisible) => {
            isTargetVisible = isVisible;
            syncRunning();
          },
          targetVisibilityOptions,
        );

  return {
    start() {
      wantsRunning = true;
      syncRunning();
    },
    stop() {
      wantsRunning = false;
      syncRunning();
    },
    dispose() {
      disposed = true;
      wantsRunning = false;
      syncRunning();
      unobserveTarget?.();
      if (typeof document !== 'undefined') {
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange,
        );
      }
    },
    isRunning: () => loop.isRunning(),
  };
}
