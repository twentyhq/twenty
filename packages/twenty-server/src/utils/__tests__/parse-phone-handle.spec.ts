import { parsePhoneHandle } from 'src/utils/parse-phone-handle';

describe('parsePhoneHandle', () => {
  it('parses a WhatsApp-style handle without a plus sign', () => {
    expect(parsePhoneHandle('14155552671')).toEqual({
      primaryPhoneNumber: '4155552671',
      primaryPhoneCallingCode: '+1',
      primaryPhoneCountryCode: 'US',
      additionalPhones: null,
    });
  });

  it('parses an E.164 handle with a plus sign', () => {
    expect(parsePhoneHandle('+919876543210')).toEqual({
      primaryPhoneNumber: '9876543210',
      primaryPhoneCallingCode: '+91',
      primaryPhoneCountryCode: 'IN',
      additionalPhones: null,
    });
  });

  it('parses a formatted handle with separators', () => {
    expect(parsePhoneHandle('+1 (415) 555-2671')).toEqual({
      primaryPhoneNumber: '4155552671',
      primaryPhoneCallingCode: '+1',
      primaryPhoneCountryCode: 'US',
      additionalPhones: null,
    });
  });

  it('falls back to a possible country when the number is not strictly valid', () => {
    expect(parsePhoneHandle('15551234567')).toEqual({
      primaryPhoneNumber: '5551234567',
      primaryPhoneCallingCode: '+1',
      primaryPhoneCountryCode: 'US',
      additionalPhones: null,
    });
  });

  it('returns null for an email handle', () => {
    expect(parsePhoneHandle('john.doe@company.com')).toBeNull();
  });

  it('returns null for a display name', () => {
    expect(parsePhoneHandle('John Doe')).toBeNull();
  });

  it('returns null for a number too short to be a phone', () => {
    expect(parsePhoneHandle('12345')).toBeNull();
  });

  it('returns null for an empty handle', () => {
    expect(parsePhoneHandle('')).toBeNull();
  });
});
