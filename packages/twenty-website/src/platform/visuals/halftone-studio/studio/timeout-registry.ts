export type TimeoutHandle = number | ReturnType<typeof setTimeout>;

export type TimeoutRegistry = {
  clearAll: () => void;
  pendingCount: () => number;
  schedule: (callback: () => void, delayMs: number) => () => void;
};

type CreateTimeoutRegistryOptions<THandle> = {
  clearTimeout?: (handle: THandle) => void;
  setTimeout?: (callback: () => void, delayMs: number) => THandle;
};

// The studio lives under platform/, which cannot reach the app-preview stage's
// registry (layer law), so it carries its own copy: a Set of live timeouts the
// root clears on unmount.
export function createTimeoutRegistry<THandle = TimeoutHandle>({
  clearTimeout: clearTimeoutFn = globalThis.clearTimeout as unknown as (
    handle: THandle,
  ) => void,
  setTimeout: setTimeoutFn = globalThis.setTimeout as unknown as (
    callback: () => void,
    delayMs: number,
  ) => THandle,
}: CreateTimeoutRegistryOptions<THandle> = {}): TimeoutRegistry {
  const handles = new Set<THandle>();

  const cancel = (handle: THandle) => {
    if (!handles.delete(handle)) {
      return;
    }

    clearTimeoutFn(handle);
  };

  const clearAll = () => {
    Array.from(handles).forEach(cancel);
  };

  const schedule = (callback: () => void, delayMs: number) => {
    const handle = setTimeoutFn(() => {
      handles.delete(handle);
      callback();
    }, delayMs);

    handles.add(handle);

    return () => cancel(handle);
  };

  return {
    clearAll,
    pendingCount: () => handles.size,
    schedule,
  };
}
