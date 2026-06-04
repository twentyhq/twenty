import { formatUsdRate, formatUsdCompact } from '@/lib/format/format-usd';

describe('formatUsdRate', () => {
  it.each([
    [null, null],
    [0, '$0'],
    [150, '$150'],
    [5000, '$5,000'],
    [25000, '$25,000'],
  ])('formats %p as %p', (input, expected) => {
    expect(formatUsdRate(input)).toBe(expected);
  });

  it('returns null for NaN', () => {
    expect(formatUsdRate(Number.NaN)).toBeNull();
  });
});

describe('formatUsdCompact', () => {
  it.each([
    [null, null],
    [0, '$0'],
    [150, '$150'],
    [5000, '$5K'],
    [25000, '$25K'],
    [1500000, '$1.5M'],
  ])('formats %p as %p', (input, expected) => {
    expect(formatUsdCompact(input)).toBe(expected);
  });

  it('returns null for NaN', () => {
    expect(formatUsdCompact(Number.NaN)).toBeNull();
  });
});
