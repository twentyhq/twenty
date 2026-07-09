import { type PhonesMetadata } from 'twenty-shared/types';

import { getPhoneHandlesFromPhones } from 'src/modules/match-participant/utils/get-phone-handles-from-phones';

const buildPhones = ({
  primaryPhoneNumber,
  primaryPhoneCallingCode,
}: {
  primaryPhoneNumber: string;
  primaryPhoneCallingCode: string;
}): PhonesMetadata => ({
  primaryPhoneNumber,
  primaryPhoneCallingCode,
  primaryPhoneCountryCode: 'US',
  additionalPhones: null,
});

describe('getPhoneHandlesFromPhones', () => {
  it('returns dialing variants for a phone with a calling code', () => {
    expect(
      getPhoneHandlesFromPhones({
        phones: buildPhones({
          primaryPhoneNumber: '5551234567',
          primaryPhoneCallingCode: '+1',
        }),
      }),
    ).toEqual(['15551234567', '+15551234567', '5551234567']);
  });

  it('returns only the raw number when the calling code is empty', () => {
    expect(
      getPhoneHandlesFromPhones({
        phones: buildPhones({
          primaryPhoneNumber: '5551234567',
          primaryPhoneCallingCode: '',
        }),
      }),
    ).toEqual(['5551234567']);
  });

  it('returns no handles when the primary phone number is empty', () => {
    expect(
      getPhoneHandlesFromPhones({
        phones: buildPhones({
          primaryPhoneNumber: '',
          primaryPhoneCallingCode: '+1',
        }),
      }),
    ).toEqual([]);
  });

  it('returns no handles when phones is not defined', () => {
    expect(getPhoneHandlesFromPhones({ phones: undefined })).toEqual([]);
  });
});
