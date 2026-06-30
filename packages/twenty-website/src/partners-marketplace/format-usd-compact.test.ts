import { formatUsdCompact } from './format-usd-compact';

describe('formatUsdCompact', () => {
  it('returns null when the amount is null', () => {
    expect(formatUsdCompact(null)).toBeNull();
  });

  it('returns null when the amount is NaN', () => {
    expect(formatUsdCompact(Number.NaN)).toBeNull();
  });

  it('renders sub-thousand amounts in full', () => {
    expect(formatUsdCompact(140)).toBe('$140');
  });

  it('renders zero', () => {
    expect(formatUsdCompact(0)).toBe('$0');
  });

  it('compacts thousands', () => {
    expect(formatUsdCompact(8000)).toBe('$8K');
  });

  it('compacts thousands to one decimal', () => {
    expect(formatUsdCompact(8500)).toBe('$8.5K');
  });

  it('compacts larger budgets', () => {
    expect(formatUsdCompact(25000)).toBe('$25K');
  });
});
