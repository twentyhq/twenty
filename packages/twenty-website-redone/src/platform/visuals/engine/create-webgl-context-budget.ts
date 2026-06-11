type SlotPriority = 'priority' | 'normal';

type SlotRequest = {
  priority?: SlotPriority;
  onGranted: () => void;
};

type SlotRecord = {
  priority: SlotPriority;
  onGranted: () => void;
  state: 'pending' | 'held' | 'settled';
};

export type WebGlContextBudget = {
  // Returns settle(): idempotent; dequeues a pending request or releases a
  // held slot. The ONLY cleanup consumers ever call.
  request: (slotRequest: SlotRequest) => () => void;
  getActiveCount: () => number;
  getPendingCount: () => number;
};

type BudgetHost = {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number },
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
  setTimeout: (callback: () => void, delayMs: number) => number;
  clearTimeout: (handle: number) => void;
};

type CreateWebGlContextBudgetOptions = {
  maxActive: number;
  host?: BudgetHost;
};

// Grants are paced through idle time so six visuals entering the viewport
// in one frame don't compile shaders in the same task.
const PRIORITY_GRANT_TIMEOUT_MS = 0;
const NORMAL_GRANT_TIMEOUT_MS = 80;

function getDefaultHost(): BudgetHost {
  return {
    requestIdleCallback:
      typeof requestIdleCallback === 'function'
        ? (callback, options) => requestIdleCallback(callback, options)
        : undefined,
    cancelIdleCallback:
      typeof cancelIdleCallback === 'function'
        ? (handle) => cancelIdleCallback(handle)
        : undefined,
    setTimeout: (callback, delayMs) =>
      setTimeout(callback, delayMs) as unknown as number,
    clearTimeout: (handle) => clearTimeout(handle as unknown as number),
  };
}

// The single owner of context-slot state. There is no try-then-subscribe
// API on purpose: acquisition is request-or-queue inside one module, so
// the released-in-the-gap race of the previous engine is unrepresentable.
// Held slots are identified by their record (not a counter), so a stale
// cleanup can only ever release its own slot — double-release is a no-op.
export function createWebGlContextBudget({
  maxActive,
  host = getDefaultHost(),
}: CreateWebGlContextBudgetOptions): WebGlContextBudget {
  const pending: SlotRecord[] = [];
  const held = new Set<SlotRecord>();

  let scheduledDrain: { kind: 'idle' | 'timeout'; handle: number } | null =
    null;
  let scheduledDrainPriority: SlotPriority | null = null;

  const nextPending = (): SlotRecord | undefined =>
    pending.find((record) => record.priority === 'priority') ?? pending[0];

  const cancelScheduledDrain = () => {
    if (scheduledDrain === null) {
      return;
    }
    if (scheduledDrain.kind === 'idle') {
      host.cancelIdleCallback?.(scheduledDrain.handle);
    } else {
      host.clearTimeout(scheduledDrain.handle);
    }
    scheduledDrain = null;
    scheduledDrainPriority = null;
  };

  const drainOne = () => {
    scheduledDrain = null;
    scheduledDrainPriority = null;

    if (held.size >= maxActive) {
      return;
    }
    const record = nextPending();
    if (record === undefined) {
      return;
    }

    pending.splice(pending.indexOf(record), 1);
    record.state = 'held';
    held.add(record);
    record.onGranted();

    scheduleDrain();
  };

  const scheduleDrain = () => {
    if (held.size >= maxActive) {
      return;
    }
    const record = nextPending();
    if (record === undefined) {
      return;
    }

    // A waiting priority request preempts an already-scheduled normal drain.
    if (scheduledDrain !== null) {
      if (
        record.priority === 'priority' &&
        scheduledDrainPriority === 'normal'
      ) {
        cancelScheduledDrain();
      } else {
        return;
      }
    }

    const timeout =
      record.priority === 'priority'
        ? PRIORITY_GRANT_TIMEOUT_MS
        : NORMAL_GRANT_TIMEOUT_MS;

    if (host.requestIdleCallback) {
      scheduledDrain = {
        kind: 'idle',
        handle: host.requestIdleCallback(drainOne, { timeout }),
      };
    } else {
      scheduledDrain = {
        kind: 'timeout',
        handle: host.setTimeout(drainOne, timeout),
      };
    }
    scheduledDrainPriority = record.priority;
  };

  return {
    request({ priority = 'normal', onGranted }) {
      const record: SlotRecord = { priority, onGranted, state: 'pending' };
      pending.push(record);
      scheduleDrain();

      return function settle() {
        if (record.state === 'settled') {
          return;
        }
        if (record.state === 'pending') {
          const index = pending.indexOf(record);
          if (index !== -1) {
            pending.splice(index, 1);
          }
          record.state = 'settled';
          return;
        }
        // held → release exactly this record's slot, then let the queue move.
        held.delete(record);
        record.state = 'settled';
        scheduleDrain();
      };
    },
    getActiveCount: () => held.size,
    getPendingCount: () => pending.length,
  };
}
