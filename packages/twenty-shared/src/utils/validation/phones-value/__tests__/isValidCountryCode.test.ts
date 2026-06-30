import { isValidCountryCode } from '@/utils/validation/phones-value/isValidCountryCode';

describe('isValidCountryCode', () => {
  it('should return true for valid country code US', () => {
    expect(isValidCountryCode('US')).toBe(true);
  });

  it('should return true for valid country code FR', () => {
    expect(isValidCountryCode('FR')).toBe(true);
  });

  it('should return false for invalid country code', () => {
    expect(isValidCountryCode('XX')).toBe(false);
  });

  it('should return false for lowercase', () => {
    expect(isValidCountryCode('us')).toBe(false);
  });
});
