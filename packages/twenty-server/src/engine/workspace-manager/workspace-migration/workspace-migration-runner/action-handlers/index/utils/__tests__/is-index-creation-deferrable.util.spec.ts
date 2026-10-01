import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { isIndexCreationDeferrable } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/is-index-creation-deferrable.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatIndexMetadataMock } from 'src/engine/metadata-modules/flat-index-metadata/__mocks__/get-flat-index-metadata.mock';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';

const TIMELINE_ACTIVITY_OBJECT_UNIVERSAL_IDENTIFIER = 'timeline-activity';

const buildJoinColumnField = (
  overrides: Partial<FlatFieldMetadata> = {},
): FlatFieldMetadata =>
  getFlatFieldMetadataMock({
    universalIdentifier: 'target-new-app-object',
    objectMetadataId: 'timeline-activity-id',
    type: FieldMetadataType.MORPH_RELATION,
    name: 'targetNewAppObject',
    settings: {
      relationType: RelationType.MANY_TO_ONE,
      joinColumnName: 'targetNewAppObjectId',
    },
    ...overrides,
  });

const buildIndex = (
  indexedFlatFieldMetadatas: FlatFieldMetadata[],
  overrides: Partial<FlatIndexMetadata> = {},
): FlatIndexMetadata =>
  getFlatIndexMetadataMock({
    universalIdentifier: 'index',
    objectMetadataId: 'timeline-activity-id',
    objectMetadataUniversalIdentifier:
      TIMELINE_ACTIVITY_OBJECT_UNIVERSAL_IDENTIFIER,
    applicationUniversalIdentifier: 'application',
    flatIndexFieldMetadatas: indexedFlatFieldMetadatas.map(
      (flatFieldMetadata, order) => ({
        id: `index-field-${order}`,
        workspaceId: 'workspace-id',
        indexMetadataId: 'index-id',
        fieldMetadataId: flatFieldMetadata.id,
        subFieldName: null,
        order,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }),
    ),
    ...overrides,
  });

describe('isIndexCreationDeferrable', () => {
  it('should defer a join column index', () => {
    const joinColumnField = buildJoinColumnField();

    expect(
      isIndexCreationDeferrable({
        flatIndexMetadata: buildIndex([joinColumnField]),
        indexedFlatFieldMetadatas: [joinColumnField],
      }),
    ).toBe(true);
  });

  it('should not defer a unique index', () => {
    const joinColumnField = buildJoinColumnField();

    expect(
      isIndexCreationDeferrable({
        flatIndexMetadata: buildIndex([joinColumnField], { isUnique: true }),
        indexedFlatFieldMetadatas: [joinColumnField],
      }),
    ).toBe(false);
  });

  it('should not defer a partial index', () => {
    const joinColumnField = buildJoinColumnField();

    expect(
      isIndexCreationDeferrable({
        flatIndexMetadata: buildIndex([joinColumnField], {
          indexWhereClause: '"deletedAt" IS NULL',
        }),
        indexedFlatFieldMetadatas: [joinColumnField],
      }),
    ).toBe(false);
  });

  it('should not defer an index on a non relation field', () => {
    const textField = getFlatFieldMetadataMock({
      universalIdentifier: 'name',
      objectMetadataId: 'timeline-activity-id',
      type: FieldMetadataType.TEXT,
    });

    expect(
      isIndexCreationDeferrable({
        flatIndexMetadata: buildIndex([textField]),
        indexedFlatFieldMetadatas: [textField],
      }),
    ).toBe(false);
  });

  it('should not defer an index on the one to many side of a relation', () => {
    const oneToManyField = buildJoinColumnField({
      type: FieldMetadataType.RELATION,
      settings: { relationType: RelationType.ONE_TO_MANY },
    });

    expect(
      isIndexCreationDeferrable({
        flatIndexMetadata: buildIndex([oneToManyField]),
        indexedFlatFieldMetadatas: [oneToManyField],
      }),
    ).toBe(false);
  });

  it('should not defer an index mixing a join column with another field', () => {
    const joinColumnField = buildJoinColumnField();
    const textField = getFlatFieldMetadataMock({
      universalIdentifier: 'name',
      objectMetadataId: 'timeline-activity-id',
      type: FieldMetadataType.TEXT,
    });

    expect(
      isIndexCreationDeferrable({
        flatIndexMetadata: buildIndex([joinColumnField, textField]),
        indexedFlatFieldMetadatas: [joinColumnField, textField],
      }),
    ).toBe(false);
  });

  it('should not defer when an indexed field cannot be resolved', () => {
    const joinColumnField = buildJoinColumnField();

    expect(
      isIndexCreationDeferrable({
        flatIndexMetadata: buildIndex([joinColumnField]),
        indexedFlatFieldMetadatas: [],
      }),
    ).toBe(false);
  });
});
