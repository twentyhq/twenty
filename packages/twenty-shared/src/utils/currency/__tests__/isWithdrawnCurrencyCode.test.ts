import { isWithdrawnCurrencyCode } from '@/utils/currency/isWithdrawnCurrencyCode';

describe('isWithdrawnCurrencyCode', () => {
  it('returns true for a withdrawn currency code', () => {
    expect(isWithdrawnCurrencyCode('ANG')).toBe(true);
  });

  it.each([['XCG'], ['USD'], ['toString'], ['']])(
    'returns false for %p',
    (currencyCode) => {
      expect(isWithdrawnCurrencyCode(currencyCode)).toBe(false);
    },
  );
});
