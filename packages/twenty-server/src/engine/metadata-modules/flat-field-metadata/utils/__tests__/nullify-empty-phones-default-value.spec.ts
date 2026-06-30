import { nullifyEmptyPhonesDefaultValue } from '../nullify-empty-phones-default-value.util';

describe('nullifyEmptyPhonesDefaultValue', () => {
  it('returns null when all fields are null-equivalent', () => {
    expect(
      nullifyEmptyPhonesDefaultValue({
        primaryPhoneNumber: "''",
        primaryPhoneCountryCode: "''",
        primaryPhoneCallingCode: null,
        additionalPhones: null,
      }),
    ).toBeNull();
  });

  it('returns normalized object when primaryPhoneNumber has a value', () => {
    expect(
      nullifyEmptyPhonesDefaultValue({
        primaryPhoneNumber: '+33612345678',
        primaryPhoneCountryCode: "''",
        primaryPhoneCallingCode: '',
        additionalPhones: null,
      }),
    ).toEqual({
      primaryPhoneNumber: '+33612345678',
      primaryPhoneCountryCode: null,
      primaryPhoneCallingCode: null,
      additionalPhones: null,
    });
  });
});
