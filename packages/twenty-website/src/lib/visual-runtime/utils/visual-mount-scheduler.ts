export type VisualMountPriority = 'normal' | 'priority';

type TimeoutHandle = ReturnType<typeof setTimeout>;

type VisualMountSchedulerHost = {
  cancelAnimationFrame?: (handle: number) => void;
  cancelIdleCallback?: (handle: number) => void;
  clearTimeout?: (handle: TimeoutHandle) => void;
  requestAnimationFrame?: (callback: FrameRequestCallback) => number;
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => number;
  setTimeout?: (callback: () => void, delayMs: number) => TimeoutHandle;
};

type ScheduleVisualMountOptions = {
  priority?: VisualMountPriority;
  timeoutMs?: number;
};

type VisualMountScheduler = {
  schedule: (
    callback: () => void,
    options?: ScheduleVisualMountOptions,
  ) => () => void;
};

type VisualMountJob = {
  callback: () => void;
  cancelled: boolean;
  priority: VisualMountPriority;
  timeoutMs: number;
};

const NORMAL_MOUNT_TIMEOUT_MS = 80;
const PRIORITY_MOUNT_TIMEOUT_MS = 0;

function getDefaultHost(): VisualMountSchedulerHost {
  if (typeof window === 'undefined') {
    return {};
  }

  return {
    cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
    cancelIdleCallback: window.cancelIdleCallback?.bind(window),
    clearTimeout: window.clearTimeout.bind(window),
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
    requestIdleCallback: window.requestIdleCallback?.bind(window),
    setTimeout: window.setTimeout.bind(window),
  };
}

function getJobTimeoutMs({
  priority,
  timeoutMs,
}: {
  priority: VisualMountPriority;
  timeoutMs?: number;
}) {
  if (typeof timeoutMs === 'number') {
    return timeoutMs;
  }

  return priority === 'priority'
    ? PRIORITY_MOUNT_TIMEOUT_MS
    : NORMAL_MOUNT_TIMEOUT_MS;
}

function insertJobByPriority(queue: VisualMountJob[], job: VisualMountJob) {
  if (job.priority === 'normal') {
    queue.push(job);
    return;
  }

  const firstNormalIndex = queue.findIndex(
    (queuedJob) => queuedJob.priority === 'normal',
  );

  if (firstNormalIndex === -1) {
    queue.push(job);
    return;
  }

  queue.splice(firstNormalIndex, 0, job);
}

function removeJob(queue: VisualMountJob[], job: VisualMountJob) {
  const index = queue.indexOf(job);

  if (index === -1) {
    return;
  }

  queue.splice(index, 1);
}

export function createVisualMountScheduler(
  host: VisualMountSchedulerHost = getDefaultHost(),
): VisualMountScheduler {
  const {
    cancelAnimationFrame,
    cancelIdleCallback,
    clearTimeout = globalThis.clearTimeout,
    requestAnimationFrame,
    requestIdleCallback,
    setTimeout = globalThis.setTimeout,
  } = host;

  const queue: VisualMountJob[] = [];
  let cancelScheduledDrain: (() => void) | null = null;

  const cancelDrainIfIdle = () => {
    if (queue.length > 0 || cancelScheduledDrain === null) {
      return;
    }

    cancelScheduledDrain();
    cancelScheduledDrain = null;
  };

  const scheduleDrain = () => {
    if (cancelScheduledDrain !== null || queue.length === 0) {
      return;
    }

    const nextJob = queue[0];
    const runNextJob = () => {
      cancelScheduledDrain = null;

      while (queue.length > 0) {
        const job = queue.shift();

        if (!job || job.cancelled) {
          continue;
        }

        job.callback();
        break;
      }

      scheduleDrain();
    };

    if (requestIdleCallback && cancelIdleCallback) {
      const idleHandle = requestIdleCallback(runNextJob, {
        timeout: nextJob.timeoutMs,
      });
      cancelScheduledDrain = () => cancelIdleCallback(idleHandle);

      return;
    }

    if (requestAnimationFrame && cancelAnimationFrame) {
      let timeoutHandle: TimeoutHandle | null = null;
      const animationFrameHandle = requestAnimationFrame(() => {
        timeoutHandle = setTimeout(runNextJob, 0);
      });

      cancelScheduledDrain = () => {
        cancelAnimationFrame(animationFrameHandle);

        if (timeoutHandle !== null) {
          clearTimeout(timeoutHandle);
        }
      };

      return;
    }

    const timeoutHandle = setTimeout(runNextJob, nextJob.timeoutMs);
    cancelScheduledDrain = () => clearTimeout(timeoutHandle);
  };

  return {
    schedule: (callback, options = {}) => {
      const priority = options.priority ?? 'normal';
      const job: VisualMountJob = {
        callback,
        cancelled: false,
        priority,
        timeoutMs: getJobTimeoutMs({
          priority,
          timeoutMs: options.timeoutMs,
        }),
      };

      insertJobByPriority(queue, job);

      if (priority === 'priority' && cancelScheduledDrain !== null) {
        cancelScheduledDrain();
        cancelScheduledDrain = null;
      }

      scheduleDrain();

      return () => {
        if (job.cancelled) {
          return;
        }

        job.cancelled = true;
        removeJob(queue, job);
        cancelDrainIfIdle();
      };
    },
  };
}

const visualMountScheduler = createVisualMountScheduler();

export const scheduleVisualMount = visualMountScheduler.schedule;
