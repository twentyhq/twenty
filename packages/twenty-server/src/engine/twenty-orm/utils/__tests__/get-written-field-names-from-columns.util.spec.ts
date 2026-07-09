import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getWrittenFieldNamesFromColumns } from 'src/engine/twenty-orm/utils/get-written-field-names-from-columns.util';

const mockObjectMetadata = {
  id: '1',
  nameSingular: 'workspaceMember',
  namePlural: 'workspaceMembers',
  fieldIds: [],
} as unknown as FlatObjectMetadata;

const mockFlatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
  byUniversalIdentifier: {},
  universalIdentifierById: {},
  universalIdentifiersByApplicationId: {},
};

describe('getWrittenFieldNamesFromColumns', () => {
  it('returns scalar column names as-is', () => {
    const result = getWrittenFieldNamesFromColumns(
      ['id', 'avatarUrl', 'jobTitle'],
      mockObjectMetadata,
      mockFlatFieldMetadataMaps,
    );

    expect(result).toEqual(new Set(['id', 'avatarUrl', 'jobTitle']));
  });

  it('returns an empty set for no written columns', () => {
    const result = getWrittenFieldNamesFromColumns(
      [],
      mockObjectMetadata,
      mockFlatFieldMetadataMaps,
    );

    expect(result.size).toBe(0);
  });
});
