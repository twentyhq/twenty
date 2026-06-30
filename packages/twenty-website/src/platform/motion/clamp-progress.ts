// Every progress computation shares one clamp to the unit interval.
export function clampProgress(value: number): number {
  return Math.max(0, Math.min(1, value));
}
