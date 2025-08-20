import { faker } from '@faker-js/faker';

import { type FlatIndexFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-index-field-metadata';

type FlatIndexFieldMetadataOverrides = Required<
  Pick<
    FlatIndexFieldMetadata,
    'fieldMetadataId' | 'indexMetadataId' | 'uniqueIdentifier'
  >
> &
  Partial<FlatIndexFieldMetadata>;
export const getFlatIndexFieldMetadataMock = (
  overrides: FlatIndexFieldMetadataOverrides,
): FlatIndexFieldMetadata => {
  const createdAt = '2024-01-01T00:00:00.000Z' as unknown as Date;

  return {
    createdAt,
    id: faker.string.uuid(),
    order: faker.number.int(),
    updatedAt: createdAt,
    ...overrides,
  };
};
