import { faker } from '@faker-js/faker';

import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { FlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-index-metadata';

type FlatIndexMetadataOverrides = Required<
  Pick<FlatIndexMetadata, 'uniqueIdentifier' | 'objectMetadataId'>
> &
  Partial<FlatIndexMetadata>;
export const getFlatIndexMetadataMock = (
  overrides: FlatIndexMetadataOverrides,
): FlatIndexMetadata => {
  const createdAt = faker.date.anytime();

  return {
    flatIndexFieldMetadatas: [],
    createdAt,
    id: faker.string.uuid(),
    indexType: IndexType.BTREE,
    indexWhereClause: undefined,
    isCustom: false,
    isUnique: false,
    name: 'defaultFlatIndexMetadataName',
    updatedAt: createdAt,
    workspaceId: faker.string.uuid(),
    ...overrides,
  };
};

export const getStandardFlatIndexMetadataMock = (
  overrides: Omit<FlatIndexMetadataOverrides, 'isCustom'>,
) => {
  return getFlatIndexMetadataMock({
    isCustom: false,
    ...overrides,
  });
};
