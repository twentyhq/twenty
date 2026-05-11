export type TimeoutHandle = number | ReturnType<typeof setTimeout>;

export type TimeoutRegistry = {
  clearAll: () => void;
  pendingCount: () => number;
  schedule: (callback: () => void, delayMs: number) => () => void;
};

type CreateTimeoutRegistryOptions<Handle> = {
  clearTimeout?: (handle: Handle) => void;
  setTimeout?: (callback: () => void, delayMs: number) => Handle;
};

export function createTimeoutRegistry<Handle = TimeoutHandle>({
  clearTimeout: clearTimeoutFn = globalThis.clearTimeout as unknown as (
    handle: Handle,
  ) => void,
  setTimeout: setTimeoutFn = globalThis.setTimeout as unknown as (
    callback: () => void,
    delayMs: number,
  ) => Handle,
}: CreateTimeoutRegistryOptions<Handle> = {}): TimeoutRegistry {
  const handles = new Set<Handle>();

  const cancel = (handle: Handle) => {
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
