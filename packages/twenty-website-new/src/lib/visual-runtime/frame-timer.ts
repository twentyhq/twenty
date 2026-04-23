/**
 * Per-frame timing primitive built on `performance.now()`.
 *
 * Replaces `new THREE.Clock()` (deprecated since three r178 in favor of
 * `THREE.Timer`) without dragging in `THREE.Timer`'s `connect/dispose`
 * lifecycle — every WebGL scene on the marketing site only needs two
 * numbers per frame: "seconds since the last frame" and "seconds since
 * the timer started", both of which are trivially derived from the
 * monotonic high-resolution clock.
 *
 * The first `tick()` returns 0 so the very first rendered frame doesn't
 * apply a jumbo delta accumulated between renderer construction and the
 * first `requestAnimationFrame` callback.
 *
 * `getElapsed()` reflects the wall time since the timer was created and
 * is independent of how often `tick()` is called — that matches the
 * semantics of `THREE.Clock#getElapsedTime` that scenes rely on for
 * shader uniforms (which need a continuous, monotonically increasing
 * time value, not a sum of deltas).
 */
export type FrameTimer = {
  /** Seconds since the previous `tick()` call (0 on the first call). */
  tick: () => number;
  /** Seconds since the timer was created, monotonically increasing. */
  getElapsed: () => number;
};

export function createFrameTimer(): FrameTimer {
  const startedAt = performance.now();
  let previousTickAt: number | null = null;

  return {
    tick: () => {
      const now = performance.now();
      if (previousTickAt === null) {
        previousTickAt = now;
        return 0;
      }
      const deltaSeconds = (now - previousTickAt) / 1000;
      previousTickAt = now;
      return deltaSeconds;
    },
    getElapsed: () => (performance.now() - startedAt) / 1000,
  };
}
