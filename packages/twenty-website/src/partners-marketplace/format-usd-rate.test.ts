import { formatUsdRate } from './format-usd-rate';

describe('formatUsdRate', () => {
  it('returns null when the amount is null', () => {
    expect(formatUsdRate(null)).toBeNull();
  });

  it('returns null when the amount is NaN', () => {
    expect(formatUsdRate(Number.NaN)).toBeNull();
  });

  it('formats an hourly rate in full', () => {
    expect(formatUsdRate(140)).toBe('$140');
  });

  it('formats a project budget with grouping and no decimals', () => {
    expect(formatUsdRate(25000)).toBe('$25,000');
  });
});
