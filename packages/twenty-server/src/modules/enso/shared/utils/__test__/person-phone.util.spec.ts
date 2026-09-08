import {
  readPersonPhoneE164,
  toE164,
} from 'src/modules/enso/shared/utils/person-phone.util';

describe('toE164', () => {
  it('should prepend the calling code with a plus', () => {
    expect(toE164('+373', '69143382')).toBe('+37369143382');
  });

  it('should add the missing plus when the calling code has none', () => {
    expect(toE164('373', '69143382')).toBe('+37369143382');
  });

  it('should return the bare number when there is no calling code', () => {
    expect(toE164(undefined, '69143382')).toBe('69143382');
    expect(toE164('', '69143382')).toBe('69143382');
  });

  it('should return undefined when there is no number', () => {
    // primaryPhoneNumber defaults to '' rather than null for phone-less people
    // (social contacts), so the empty string has to count as absent.
    expect(toE164('+373', '')).toBeUndefined();
    expect(toE164('+373', null)).toBeUndefined();
  });
});

describe('readPersonPhoneE164', () => {
  it('should compose both halves of the PHONES composite', () => {
    expect(
      readPersonPhoneE164({
        phones: {
          primaryPhoneNumber: '69143382',
          primaryPhoneCallingCode: '+373',
        },
      }),
    ).toBe('+37369143382');
  });

  it('should return undefined for a person with no phone', () => {
    expect(
      readPersonPhoneE164({
        phones: { primaryPhoneNumber: '', primaryPhoneCallingCode: '' },
      }),
    ).toBeUndefined();
    expect(readPersonPhoneE164({ phones: null })).toBeUndefined();
    expect(readPersonPhoneE164(null)).toBeUndefined();
  });
});
