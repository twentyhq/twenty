/* oxlint-disable twenty/no-hardcoded-colors */

export const RGBA = (hex: string, alpha: number) => {
  const normalized = hex.replace(/^#/, '');
  const expanded =
    normalized.length < 6
      ? normalized
          .split('')
          .map((channel) => channel + channel)
          .join('')
      : normalized;
  const red = parseInt(expanded.slice(0, 2), 16);
  const green = parseInt(expanded.slice(2, 4), 16);
  const blue = parseInt(expanded.slice(4, 6), 16);
  return `rgba(${red},${green},${blue},${alpha})`;
};
