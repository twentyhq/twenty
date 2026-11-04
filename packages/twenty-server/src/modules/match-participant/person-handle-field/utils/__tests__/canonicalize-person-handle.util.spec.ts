import { FieldMetadataType } from 'twenty-shared/types';

import { canonicalizePersonHandle } from 'src/modules/match-participant/person-handle-field/utils/canonicalize-person-handle.util';

describe('canonicalizePersonHandle', () => {
  it.each([
    [FieldMetadataType.EMAILS, ' Ada@Example.com ', 'ada@example.com'],
    [FieldMetadataType.TEXT, ' AdaLovelace ', 'adalovelace'],
    [FieldMetadataType.PHONES, '+33 6 12-34.56 78', '+33612345678'],
    [FieldMetadataType.PHONES, '33612345678', '+33612345678'],
    [
      FieldMetadataType.LINKS,
      'HTTPS://www.LinkedIn.com/in/ada-lovelace/#about',
      'linkedin.com/in/ada-lovelace',
    ],
    [
      FieldMetadataType.LINKS,
      'https://www.facebook.com/profile.php?id=111',
      'facebook.com/profile.php?id=111',
    ],
    [
      FieldMetadataType.LINKS,
      'https://Example.com/watch/?v=AbC#t=10',
      'example.com/watch?v=AbC',
    ],
    [
      FieldMetadataType.LINKS,
      'linkedin.com/in/ada-lovelace',
      'linkedin.com/in/ada-lovelace',
    ],
  ] as const)('canonicalizes a %s handle %j', (type, value, expected) => {
    expect(canonicalizePersonHandle({ type, value })).toBe(expected);
  });

  it.each([
    [FieldMetadataType.EMAILS, '   '],
    [FieldMetadataType.PHONES, 'no digits'],
    [FieldMetadataType.LINKS, 'https://'],
    [FieldMetadataType.TEXT, null],
  ] as const)('returns null for an empty %s handle', (type, value) => {
    expect(canonicalizePersonHandle({ type, value })).toBeNull();
  });
});
