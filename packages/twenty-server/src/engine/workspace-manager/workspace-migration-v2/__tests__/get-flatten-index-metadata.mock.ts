import { faker } from '@faker-js/faker/.';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { FlattenIndexMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flatten-index-metadata';

type FlattenMetadataOverrides = Required<
  Pick<FlattenIndexMetadata, 'uniqueIdentifier' | 'objectMetadataId'>
> &
  Partial<FlattenIndexMetadata>;
export const getFlattenIndexMetadata = (
  overrides: FlattenMetadataOverrides,
): FlattenIndexMetadata => {
  const createdAt = faker.date.anytime();

  return {
    flattenIndexFieldMetadatas: [], // TODO and to test correctly we should be diffing by flattenning these
    createdAt,
    id: faker.string.uuid(),
    indexType: IndexType.BTREE,
    indexWhereClause: undefined,
    isCustom: false,
    isUnique: false,
    name: 'defaultFlattenIndexMetadataName',
    updatedAt: createdAt,
    workspaceId: faker.string.uuid(),
    ...overrides,
  };
};

export const getStandardFlattenIndexMetadata = (
  overrides: Omit<FlattenMetadataOverrides, 'isCustom' | 'isSystem'>,
) => {
  return getFlattenIndexMetadata({
    isCustom: false,
    ...overrides,
  });
};
