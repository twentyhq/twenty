import { findNonLowercaseUniversalIdentifiers } from '@/application/utils/findNonLowercaseUniversalIdentifiers';

const LOWERCASE_UNIVERSAL_IDENTIFIER = 'd1ee2c0c-a30b-4ebf-b007-377fd1d22cc3';
const UPPERCASE_UNIVERSAL_IDENTIFIER =
  LOWERCASE_UNIVERSAL_IDENTIFIER.toUpperCase();

describe('findNonLowercaseUniversalIdentifiers', () => {
  it('should return nothing for a lowercase manifest', () => {
    expect(
      findNonLowercaseUniversalIdentifiers({
        application: { universalIdentifier: LOWERCASE_UNIVERSAL_IDENTIFIER },
        fields: [
          {
            universalIdentifier: LOWERCASE_UNIVERSAL_IDENTIFIER,
            objectUniversalIdentifier: LOWERCASE_UNIVERSAL_IDENTIFIER,
          },
        ],
      }),
    ).toEqual([]);
  });

  it('should find uppercase identifiers and references anywhere in the manifest', () => {
    const mixedCaseUniversalIdentifier = 'D1ee2c0c-a30b-4ebf-b007-377fd1d22cc3';

    expect(
      findNonLowercaseUniversalIdentifiers({
        application: { universalIdentifier: UPPERCASE_UNIVERSAL_IDENTIFIER },
        objects: [
          {
            universalIdentifier: LOWERCASE_UNIVERSAL_IDENTIFIER,
            labelIdentifierFieldMetadataUniversalIdentifier:
              mixedCaseUniversalIdentifier,
          },
        ],
        roles: [
          {
            permissionFlagUniversalIdentifiers: [
              LOWERCASE_UNIVERSAL_IDENTIFIER,
              UPPERCASE_UNIVERSAL_IDENTIFIER,
            ],
          },
        ],
      }),
    ).toEqual([UPPERCASE_UNIVERSAL_IDENTIFIER, mixedCaseUniversalIdentifier]);
  });

  it('should ignore values that are not universal identifiers', () => {
    expect(
      findNonLowercaseUniversalIdentifiers({
        application: {
          universalIdentifier: LOWERCASE_UNIVERSAL_IDENTIFIER,
          displayName: 'My App',
          packageJsonChecksum: UPPERCASE_UNIVERSAL_IDENTIFIER,
        },
      }),
    ).toEqual([]);
  });
});
