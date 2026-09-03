import { isPhoneWithNonEmptyNumber } from '../isPhoneWithNonEmptyNumber';

describe('isPhoneWithNonEmptyNumber', () => {
  it.each([
    [{ number: '123456789', callingCode: '+1', countryCode: 'US' }],
    [{ number: '123456789' }],
  ])('should accept %p', (phone) => {
    expect(isPhoneWithNonEmptyNumber(phone)).toBe(true);
  });

  it.each([
    [null],
    [undefined],
    [{}],
    [{ number: '' }],
    [{ number: null }],
    [{ number: undefined, callingCode: '+1', countryCode: 'US' }],
  ])('should reject %p', (phone) => {
    expect(isPhoneWithNonEmptyNumber(phone)).toBe(false);
  });

  it('should narrow the number property when used as an array filter', () => {
    const phones: { number?: string | null }[] = [
      { number: '123456789' },
      { number: '' },
      { number: null },
      {},
    ];

    const result = phones.filter(isPhoneWithNonEmptyNumber);

    expect(result).toEqual([{ number: '123456789' }]);
    expect(result.map((phone) => phone.number.length)).toEqual([9]);
  });
});
