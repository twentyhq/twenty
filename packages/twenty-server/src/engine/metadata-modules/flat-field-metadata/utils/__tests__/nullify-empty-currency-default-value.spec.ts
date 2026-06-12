import { nullifyEmptyCurrencyDefaultValue } from '../nullify-empty-currency-default-value.util';

describe('nullifyEmptyCurrencyDefaultValue', () => {
  it('returns null when both sub-fields are null or empty-string equivalent', () => {
    expect(
      nullifyEmptyCurrencyDefaultValue({
        amountMicros: null,
        currencyCode: "''",
      }),
    ).toBeNull();
  });

  it('returns normalized object when amountMicros has a value', () => {
    expect(
      nullifyEmptyCurrencyDefaultValue({
        amountMicros: 5000000,
        currencyCode: "''",
      }),
    ).toEqual({ amountMicros: 5000000, currencyCode: null });
  });

  it('returns normalized object when currencyCode has a value', () => {
    expect(
      nullifyEmptyCurrencyDefaultValue({
        amountMicros: null,
        currencyCode: 'EUR',
      }),
    ).toEqual({ amountMicros: null, currencyCode: 'EUR' });
  });
});
