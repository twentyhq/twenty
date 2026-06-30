import { nullifyEmptyAddressDefaultValue } from '../nullify-empty-address-default-value.util';

describe('nullifyEmptyAddressDefaultValue', () => {
  it('returns null when all sub-fields are empty-string equivalents or null', () => {
    expect(
      nullifyEmptyAddressDefaultValue({
        addressStreet1: "''",
        addressStreet2: '',
        addressCity: '',
        addressState: null,
        addressCountry: null,
        addressPostcode: null,
        addressLat: null,
        addressLng: null,
      }),
    ).toBeNull();
  });

  it('returns normalized object when addressCity has a value', () => {
    expect(
      nullifyEmptyAddressDefaultValue({
        addressStreet1: "''",
        addressStreet2: null,
        addressCity: 'Paris',
        addressState: '',
        addressCountry: null,
        addressPostcode: null,
        addressLat: null,
        addressLng: null,
      }),
    ).toEqual({
      addressStreet1: null,
      addressStreet2: null,
      addressCity: 'Paris',
      addressState: null,
      addressCountry: null,
      addressPostcode: null,
      addressLat: null,
      addressLng: null,
    });
  });

  it('returns object when only numeric coords are set', () => {
    expect(
      nullifyEmptyAddressDefaultValue({
        addressStreet1: null,
        addressStreet2: null,
        addressCity: null,
        addressState: null,
        addressCountry: null,
        addressPostcode: null,
        addressLat: 48.8566,
        addressLng: 2.3522,
      }),
    ).toEqual({
      addressStreet1: null,
      addressStreet2: null,
      addressCity: null,
      addressState: null,
      addressCountry: null,
      addressPostcode: null,
      addressLat: 48.8566,
      addressLng: 2.3522,
    });
  });
});
