const DEFAULT_MAX_ACTIVE_WEBGL_CONTEXTS = 6;

function readNumberEnv(value: string | undefined, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getMaxActiveWebGlContexts(): number {
  return readNumberEnv(
    process.env.NEXT_PUBLIC_MAX_WEBGL_CONTEXTS,
    DEFAULT_MAX_ACTIVE_WEBGL_CONTEXTS,
  );
}

type ChangeListener = () => void;

let activeCount = 0;
const listeners = new Set<ChangeListener>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function tryReserveWebGlContextSlot(): (() => void) | null {
  if (activeCount >= getMaxActiveWebGlContexts()) {
    return null;
  }
  activeCount += 1;
  notify();

  let released = false;
  return () => {
    if (released) {
      return;
    }
    released = true;
    activeCount = Math.max(0, activeCount - 1);
    notify();
  };
}

export function subscribeToActiveWebGlContextCount(
  listener: ChangeListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
