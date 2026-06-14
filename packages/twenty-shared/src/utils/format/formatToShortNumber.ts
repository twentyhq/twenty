// Ordered from largest to smallest. An empty suffix is the base unit.
// `next` is the unit to promote to when rounding carries over to 1000
// (e.g. 999_999 / 1000 → "1000.0" must become "1m", not "1000k").
const UNITS = [
  { threshold: 1_000_000_000, suffix: 'b', next: 'b' },
  { threshold: 1_000_000, suffix: 'm', next: 'b' },
  { threshold: 1000, suffix: 'k', next: 'm' },
  { threshold: 1, suffix: '', next: 'k' },
] as const;

export const formatToShortNumber = (amount: number) => {
  const sign = amount < 0 ? '-' : '';
  const absoluteAmount = Math.abs(amount);

  const unit =
    UNITS.find(({ threshold }) => absoluteAmount >= threshold) ??
    UNITS[UNITS.length - 1];

  const rounded = (absoluteAmount / unit.threshold).toFixed(1);

  if (rounded === '1000.0') {
    return sign + '1' + unit.next;
  }

  return sign + rounded.replace(/\.?0+$/, '') + unit.suffix;
};
