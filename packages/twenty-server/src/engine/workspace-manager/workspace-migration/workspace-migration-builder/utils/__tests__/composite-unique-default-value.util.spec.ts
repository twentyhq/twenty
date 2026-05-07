import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';

import {
  canCompositeFieldDefaultValueBeUsedInUniqueIndex,
  getCompositePropertyDefaultValueForWorkspaceSchema,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/utils/composite-unique-default-value.util';

describe('composite unique default value utils', () => {
  const phonesCompositeType = compositeTypeDefinitions.get(
    FieldMetadataType.PHONES,
  );

  if (!phonesCompositeType) {
    throw new Error('Phones composite type not found');
  }

  const primaryPhoneNumberProperty = phonesCompositeType.properties.find(
    (property) => property.name === 'primaryPhoneNumber',
  );

  const primaryPhoneCountryCodeProperty = phonesCompositeType.properties.find(
    (property) => property.name === 'primaryPhoneCountryCode',
  );

  const primaryPhoneCallingCodeProperty = phonesCompositeType.properties.find(
    (property) => property.name === 'primaryPhoneCallingCode',
  );

  if (
    !primaryPhoneNumberProperty ||
    !primaryPhoneCountryCodeProperty ||
    !primaryPhoneCallingCodeProperty
  ) {
    throw new Error('Phones composite properties not found');
  }

  it('should allow unique composite defaults when an indexed property is null-equivalent', () => {
    const canUseDefaultValue = canCompositeFieldDefaultValueBeUsedInUniqueIndex(
      {
        compositeProperties: phonesCompositeType.properties,
        defaultValue: {
          primaryPhoneNumber: "''",
          primaryPhoneCountryCode: "'US'",
          primaryPhoneCallingCode: "'+1'",
          additionalPhones: null,
        },
      },
    );

    expect(canUseDefaultValue).toBe(true);
  });

  it('should allow unique composite defaults with normalized empty strings from metadata input', () => {
    const canUseDefaultValue = canCompositeFieldDefaultValueBeUsedInUniqueIndex(
      {
        compositeProperties: phonesCompositeType.properties,
        defaultValue: {
          primaryPhoneNumber: '',
          primaryPhoneCountryCode: '',
          primaryPhoneCallingCode: '',
          additionalPhones: null,
        },
      },
    );

    expect(canUseDefaultValue).toBe(true);
  });

  it('should reject unique composite defaults when all indexed properties are non-null', () => {
    const canUseDefaultValue = canCompositeFieldDefaultValueBeUsedInUniqueIndex(
      {
        compositeProperties: phonesCompositeType.properties,
        defaultValue: {
          primaryPhoneNumber: "'4155552671'",
          primaryPhoneCountryCode: "'US'",
          primaryPhoneCallingCode: "'+1'",
          additionalPhones: null,
        },
      },
    );

    expect(canUseDefaultValue).toBe(false);
  });

  it('should convert null-equivalent indexed defaults to null for unique composite fields', () => {
    const parentFieldMetadata = {
      isUnique: true,
      defaultValue: {
        primaryPhoneNumber: "''",
        primaryPhoneCountryCode: "'US'",
        primaryPhoneCallingCode: "'+1'",
        additionalPhones: null,
      },
    };

    expect(
      getCompositePropertyDefaultValueForWorkspaceSchema({
        compositeProperty: primaryPhoneNumberProperty,
        parentFieldMetadata,
      }),
    ).toBeNull();

    expect(
      getCompositePropertyDefaultValueForWorkspaceSchema({
        compositeProperty: primaryPhoneCountryCodeProperty,
        parentFieldMetadata,
      }),
    ).toBe("'US'");

    expect(
      getCompositePropertyDefaultValueForWorkspaceSchema({
        compositeProperty: primaryPhoneCallingCodeProperty,
        parentFieldMetadata,
      }),
    ).toBe("'+1'");
  });

  it('should serialize normalized non-indexed string defaults as SQL string literals', () => {
    const parentFieldMetadata = {
      isUnique: true,
      defaultValue: {
        primaryPhoneNumber: '',
        primaryPhoneCountryCode: 'US',
        primaryPhoneCallingCode: '',
        additionalPhones: null,
      },
    };

    expect(
      getCompositePropertyDefaultValueForWorkspaceSchema({
        compositeProperty: primaryPhoneNumberProperty,
        parentFieldMetadata,
      }),
    ).toBeNull();

    expect(
      getCompositePropertyDefaultValueForWorkspaceSchema({
        compositeProperty: primaryPhoneCountryCodeProperty,
        parentFieldMetadata,
      }),
    ).toBe("'US'");

    expect(
      getCompositePropertyDefaultValueForWorkspaceSchema({
        compositeProperty: primaryPhoneCallingCodeProperty,
        parentFieldMetadata,
      }),
    ).toBeNull();
  });
});
