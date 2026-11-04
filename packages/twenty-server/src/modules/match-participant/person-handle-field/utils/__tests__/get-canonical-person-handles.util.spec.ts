import { FieldMetadataType } from 'twenty-shared/types';

import { getCanonicalPersonHandles } from 'src/modules/match-participant/person-handle-field/utils/get-canonical-person-handles.util';

describe('getCanonicalPersonHandles', () => {
  it('splits primary and additional emails', () => {
    expect(
      getCanonicalPersonHandles({
        type: FieldMetadataType.EMAILS,
        value: {
          primaryEmail: 'Ada@Example.com',
          additionalEmails: ['ada@work.example.com'],
        },
      }),
    ).toEqual({
      primary: ['ada@example.com'],
      additional: ['ada@work.example.com'],
    });
  });

  it('joins calling codes and numbers for phones', () => {
    expect(
      getCanonicalPersonHandles({
        type: FieldMetadataType.PHONES,
        value: {
          primaryPhoneNumber: '612345678',
          primaryPhoneCallingCode: '+33',
          primaryPhoneCountryCode: 'FR',
          additionalPhones: [
            { number: '2025550123', callingCode: '+1', countryCode: 'US' },
          ],
        },
      }),
    ).toEqual({
      primary: ['+33612345678'],
      additional: ['+12025550123'],
    });
  });

  it('reads primary and secondary links', () => {
    expect(
      getCanonicalPersonHandles({
        type: FieldMetadataType.LINKS,
        value: {
          primaryLinkUrl: 'https://www.linkedin.com/in/ada/',
          primaryLinkLabel: '',
          secondaryLinks: [{ url: 'https://x.com/ada', label: 'X' }],
        },
      }),
    ).toEqual({
      primary: ['linkedin.com/in/ada'],
      additional: ['x.com/ada'],
    });
  });

  it('returns nothing for an empty or missing value', () => {
    expect(
      getCanonicalPersonHandles({
        type: FieldMetadataType.PHONES,
        value: null,
      }),
    ).toEqual({ primary: [], additional: [] });
    expect(
      getCanonicalPersonHandles({
        type: FieldMetadataType.TEXT,
        value: '',
      }),
    ).toEqual({ primary: [], additional: [] });
  });
});
