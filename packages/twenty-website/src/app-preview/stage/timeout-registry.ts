// Tracks scheduled timeouts so owners can cancel them all on teardown
// (every conversation beat schedules through one of these). Ported.
export type TimeoutRegistry = {
  clearAll: () => void;
  pendingCount: () => number;
  schedule: (callback: () => void, delayMs: number) => () => void;
};

export function createTimeoutRegistry(): TimeoutRegistry {
  const handles = new Set<ReturnType<typeof setTimeout>>();
  const cancel = (handle: ReturnType<typeof setTimeout>) => {
    if (!handles.delete(handle)) {
      return;
    }
    clearTimeout(handle);
  };
  return {
    clearAll: () => {
      [...handles].forEach(cancel);
    },
    pendingCount: () => handles.size,
    schedule: (callback, delayMs) => {
      const handle = setTimeout(() => {
        handles.delete(handle);
        callback();
      }, delayMs);
      handles.add(handle);
      return () => cancel(handle);
    },
  };
}
