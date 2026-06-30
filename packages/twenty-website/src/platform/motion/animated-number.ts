export type AnimatedNumberEasing = (progress: number) => number;

// Pure number-tween math (the pricing cards' price counter): value at an
// elapsed time, eased and rounded. Ported.
const DEFAULT_DURATION_MS = 500;

function clampUnitInterval(value: number): number {
  if (Number.isNaN(value) || value <= 0) {
    return 0;
  }
  if (value >= 1) {
    return 1;
  }
  return value;
}

const easeOutCubic: AnimatedNumberEasing = (progress) =>
  1 - (1 - clampUnitInterval(progress)) ** 3;

export const animatedNumber = {
  defaultDurationMs: DEFAULT_DURATION_MS,
  easeOutCubic,
  valueAt({
    durationMs = DEFAULT_DURATION_MS,
    easing = easeOutCubic,
    elapsedMs,
    from,
    target,
  }: {
    durationMs?: number;
    easing?: AnimatedNumberEasing;
    elapsedMs: number;
    from: number;
    target: number;
  }): number {
    if (!Number.isFinite(durationMs) || durationMs <= 0) {
      return Math.round(target);
    }
    const progress = clampUnitInterval(elapsedMs / durationMs);
    return Math.round(
      from + (target - from) * clampUnitInterval(easing(progress)),
    );
  },
};
