export const isCountdownDuration = (duration: number) =>
  Number.isFinite(duration) && duration > 0;
