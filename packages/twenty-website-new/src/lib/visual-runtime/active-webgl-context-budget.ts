/**
 * Page-wide budget for live WebGL contexts.
 *
 * Browsers cap the number of WebGL contexts a single page can hold open
 * (Chromium: 16, Safari: ~8 depending on hardware). When a page exceeds
 * the cap, the browser silently evicts the oldest context, which is how
 * the marketing site used to land in "Context Lost" / "Context Restored"
 * loops on the home page (~22 visuals competing for slots).
 *
 * The budget here is an *atomic synchronous reservation* taken at the
 * `WebGlMount` layer — long before any GLB/texture fetch, long before
 * any `THREE.WebGLRenderer` is constructed. That single change kills the
 * race condition the previous design suffered from, where the policy
 * said "yes" at observer-trigger time and then a different mount grabbed
 * the last slot during the awaiting child's asset fetch.
 */

const DEFAULT_MAX_ACTIVE_WEBGL_CONTEXTS = 8;

function readNumberEnv(value: string | undefined, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getMaxActiveWebGlContexts(): number {
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

export function getActiveWebGlContextCount(): number {
  return activeCount;
}

/**
 * Try to atomically claim one budget slot.
 *
 * Returns a `release` callback when a slot was claimed, or `null` when
 * the budget is full. The caller MUST invoke `release` exactly once
 * (typically in a React effect cleanup); subsequent calls are no-ops.
 */
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
