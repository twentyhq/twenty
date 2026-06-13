/* oxlint-disable twenty/no-hardcoded-colors */

export const RGBA = (hex: string, alpha: number) => {
  const normalized = hex.replace(/^#/, '');
  // Expand #RGB / #RGBA shorthand (3 or 4 chars) to its full form; longer
  // values (6 or 8 chars) already carry full r/g/b channels.
  const expanded =
    normalized.length === 3 || normalized.length === 4
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
