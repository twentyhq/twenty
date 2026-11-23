import { faker } from '@faker-js/faker';

import { type FlatFieldMetadataOption } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option.type';

type FlatFieldMetadataOptionOverrides = Required<
  Pick<FlatFieldMetadataOption, 'universalIdentifier' | 'value' | 'position'>
> &
  Partial<FlatFieldMetadataOption>;

export const getFlatFieldMetadataOptionMock = (
  overrides: FlatFieldMetadataOptionOverrides,
): FlatFieldMetadataOption => {
  const createdAt = '2024-01-01T00:00:00.000Z';

  return {
    id: faker.string.uuid(),
    fieldMetadataId: faker.string.uuid(),
    fieldMetadataUniversalIdentifier: faker.string.uuid(),
    workspaceId: faker.string.uuid(),
    applicationId: faker.string.uuid(),
    applicationUniversalIdentifier: faker.string.uuid(),
    label: overrides.value,
    color: null,
    isActive: true,
    overrides: null,
    createdAt,
    updatedAt: createdAt,
    ...overrides,
  };
};
