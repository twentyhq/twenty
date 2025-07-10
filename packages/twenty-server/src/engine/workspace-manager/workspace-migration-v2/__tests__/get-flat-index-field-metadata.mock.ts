import { faker } from '@faker-js/faker';

import { FlatIndexFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-index-field-metadata';

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
  const createdAt = faker.date.anytime();

  return {
    createdAt,
    id: faker.string.uuid(),
    order: faker.number.int(),
    updatedAt: createdAt,
    ...overrides,
  };
};
