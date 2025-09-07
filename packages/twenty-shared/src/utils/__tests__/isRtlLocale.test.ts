import { isRtlLocale } from '../isRtlLocale';

describe('isRtlLocale', () => {
  it('returns true for rtl locales', () => {
    expect(isRtlLocale('fa')).toBe(true);
    expect(isRtlLocale('fa-IR')).toBe(true);
    expect(isRtlLocale('ar')).toBe(true);
    expect(isRtlLocale('FA-IR')).toBe(true);
  });

  it('returns false for non-rtl locales', () => {
    expect(isRtlLocale('en')).toBe(false);
    expect(isRtlLocale('en-US')).toBe(false);
    expect(isRtlLocale(undefined)).toBe(false);
  });
});
