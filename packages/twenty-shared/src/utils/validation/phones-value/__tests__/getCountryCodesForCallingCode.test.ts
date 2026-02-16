import { getCountryCodesForCallingCode } from '@/utils/validation/phones-value/getCountryCodesForCallingCode';

describe('getCountryCodesForCallingCode', () => {
  it('should return country codes for calling code 1 (US/CA)', () => {
    const result = getCountryCodesForCallingCode('1');

    expect(result).toContain('US');
    expect(result).toContain('CA');
  });

  it('should handle + prefix', () => {
    const result = getCountryCodesForCallingCode('+33');

    expect(result).toContain('FR');
  });

  it('should return empty array for invalid calling code', () => {
    expect(getCountryCodesForCallingCode('99999')).toEqual([]);
  });
});
