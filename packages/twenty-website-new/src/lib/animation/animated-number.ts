export type AnimatedNumberEasing = (progress: number) => number;
export type AnimatedNumberRounder = (value: number) => number;

export type GetAnimatedNumberValueParameters = {
  durationMs?: number;
  easing?: AnimatedNumberEasing;
  elapsedMs: number;
  from: number;
  round?: AnimatedNumberRounder;
  target: number;
};

export const DEFAULT_ANIMATED_NUMBER_DURATION_MS = 500;

const DEFAULT_ANIMATED_NUMBER_ROUNDER: AnimatedNumberRounder = Math.round;

function clampUnitInterval(value: number): number {
  if (Number.isNaN(value) || value <= 0) {
    return 0;
  }

  if (value >= 1) {
    return 1;
  }

  return value;
}

export const easeOutCubic: AnimatedNumberEasing = (progress) => {
  const clampedProgress = clampUnitInterval(progress);

  return 1 - (1 - clampedProgress) ** 3;
};

export function getAnimatedNumberValue({
  durationMs = DEFAULT_ANIMATED_NUMBER_DURATION_MS,
  easing = easeOutCubic,
  elapsedMs,
  from,
  round = DEFAULT_ANIMATED_NUMBER_ROUNDER,
  target,
}: GetAnimatedNumberValueParameters): number {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return round(target);
  }

  const progress = clampUnitInterval(elapsedMs / durationMs);
  const easedProgress = clampUnitInterval(easing(progress));

  return round(from + (target - from) * easedProgress);
}
