import { isDefined } from '@/utils/validation/isDefined';
describe('isDefined', () => {
  it('returns true if value is not undefined nor null', () => {
    expect(isDefined('')).toBe(true);
  });

  it('returns false if value is null', () => {
    expect(isDefined(null)).toBe(false);
  });

  it('returns false if value is undefined', () => {
    expect(isDefined(undefined)).toBe(false);
  });
});
