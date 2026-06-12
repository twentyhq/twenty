import {
  observeElementVisibility,
  type ObserveElementVisibilityOptions,
} from '@/lib/dom/observe-element-visibility';
import { runCleanupTasks } from '@/lib/react/run-cleanup-tasks';

export type VisualRenderLoop = {
  dispose: () => void;
  isRunning: () => boolean;
  start: () => void;
  stop: () => void;
};

type VisualRenderLoopErrorHandler = (error: unknown) => void;

export type VisualRenderLoopDocument = {
  addEventListener: Document['addEventListener'];
  hidden: boolean;
  removeEventListener: Document['removeEventListener'];
};

type VisualRenderLoopScheduler = (callback: FrameRequestCallback) => number;

type VisualRenderLoopCanceller = (handle: number) => void;
export type VisualRenderLoopFrame = {
  deltaSeconds: number;
  elapsedSeconds: number;
  timestamp: DOMHighResTimeStamp;
};
type VisualRenderLoopFrameRenderer = (
  timestamp: DOMHighResTimeStamp,
  frame: VisualRenderLoopFrame,
) => boolean | void;

type CreateVisualRenderLoopOptions = {
  cancelAnimationFrame?: VisualRenderLoopCanceller;
  document?: VisualRenderLoopDocument | null;
  onFrameError?: VisualRenderLoopErrorHandler;
  pauseWhenDocumentHidden?: boolean;
  renderFrame: VisualRenderLoopFrameRenderer;
  requestAnimationFrame?: VisualRenderLoopScheduler;
  shouldRender?: () => boolean;
  target?: Element | null;
  targetVisibilityOptions?: ObserveElementVisibilityOptions;
  visibilityObserver?: typeof observeElementVisibility;
};

const reportVisualRenderLoopErrorInDevelopment: VisualRenderLoopErrorHandler = (
  error,
) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Visual render loop failed:', error);
  }
};

const MAX_FRAME_DELTA_SECONDS = 0.1;

function getDefaultDocument(): VisualRenderLoopDocument | null {
  return typeof document === 'undefined' ? null : document;
}

function requestAnimationFrameFromWindow(callback: FrameRequestCallback) {
  return window.requestAnimationFrame(callback);
}

function cancelAnimationFrameFromWindow(handle: number) {
  window.cancelAnimationFrame(handle);
}

export function createVisualRenderLoop({
  cancelAnimationFrame = cancelAnimationFrameFromWindow,
  document: documentReference = getDefaultDocument(),
  onFrameError = reportVisualRenderLoopErrorInDevelopment,
  pauseWhenDocumentHidden = true,
  renderFrame,
  requestAnimationFrame = requestAnimationFrameFromWindow,
  shouldRender,
  target = null,
  targetVisibilityOptions,
  visibilityObserver = observeElementVisibility,
}: CreateVisualRenderLoopOptions): VisualRenderLoop {
  let disposed = false;
  let frameId: number | null = null;
  let isDocumentVisible =
    !pauseWhenDocumentHidden || !documentReference?.hidden;
  let isTargetVisible = true;
  let firstFrameAt: DOMHighResTimeStamp | null = null;
  let previousFrameAt: DOMHighResTimeStamp | null = null;
  let wantsRunning = false;

  const cleanupTasks: Array<() => void> = [];

  const canRender = () =>
    wantsRunning &&
    !disposed &&
    isDocumentVisible &&
    isTargetVisible &&
    (shouldRender?.() ?? true);

  const cancelPendingFrame = () => {
    if (frameId === null) {
      return;
    }

    cancelAnimationFrame(frameId);
    frameId = null;
    previousFrameAt = null;
  };

  const scheduleNextFrame = () => {
    if (frameId !== null || !canRender()) {
      return;
    }

    frameId = requestAnimationFrame((timestamp) => {
      frameId = null;

      if (!canRender()) {
        return;
      }

      try {
        if (firstFrameAt === null) {
          firstFrameAt = timestamp;
        }

        const deltaSeconds =
          previousFrameAt === null
            ? 0
            : Math.min(
                Math.max((timestamp - previousFrameAt) / 1000, 0),
                MAX_FRAME_DELTA_SECONDS,
              );
        previousFrameAt = timestamp;

        if (
          renderFrame(timestamp, {
            deltaSeconds,
            elapsedSeconds: Math.max((timestamp - firstFrameAt) / 1000, 0),
            timestamp,
          }) === false
        ) {
          wantsRunning = false;
          previousFrameAt = null;
          return;
        }
      } catch (error) {
        wantsRunning = false;
        previousFrameAt = null;
        onFrameError(error);
        return;
      }

      scheduleNextFrame();
    });
  };

  const syncSchedule = () => {
    if (canRender()) {
      scheduleNextFrame();
      return;
    }

    cancelPendingFrame();
  };

  if (pauseWhenDocumentHidden && documentReference) {
    const handleVisibilityChange = () => {
      isDocumentVisible = !documentReference.hidden;
      syncSchedule();
    };

    documentReference.addEventListener(
      'visibilitychange',
      handleVisibilityChange,
    );
    cleanupTasks.push(() =>
      documentReference.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      ),
    );
  }

  if (target) {
    cleanupTasks.push(
      visibilityObserver(
        target,
        (isVisible) => {
          isTargetVisible = isVisible;
          syncSchedule();
        },
        targetVisibilityOptions,
      ),
    );
  }

  const stop = () => {
    wantsRunning = false;
    cancelPendingFrame();
  };

  return {
    dispose: () => {
      if (disposed) {
        return;
      }

      disposed = true;
      stop();
      runCleanupTasks(cleanupTasks);
    },
    isRunning: () => frameId !== null,
    start: () => {
      wantsRunning = true;
      syncSchedule();
    },
    stop,
  };
}
