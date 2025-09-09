import { getFlatIndexMetadataMock } from 'src/engine/metadata-modules/flat-index-metadata/__mocks__/get-flat-index-metadata.mock';
import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata-maps/mocks/flat-object-metadata-maps.mock';
import { replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/replace-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { NOTE_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/note-flat-object.mock';
import { type WorkspaceMigrationBuilderTestCase } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/__tests__/types/workspace-migration-builder-test-case.type';

export const WORKSPACE_MIGRATION_INDEX_BUILDER_TEST_CASES: WorkspaceMigrationBuilderTestCase[] =
  [
    {
      title: 'It should build an create_index action',
      context: {
        input: {
          fromFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          toFlatObjectMetadataMaps:
            replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
              flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
              flatObjectMetadata: getFlatObjectMetadataMock({
                ...NOTE_FLAT_OBJECT_MOCK,
                flatIndexMetadatas: [
                  getFlatIndexMetadataMock({
                    objectMetadataId: NOTE_FLAT_OBJECT_MOCK.id,
                    universalIdentifier: 'field-metadata-unique-identifier-1',
                  }),
                ],
              }),
            }),
        },
        expectedActionsTypeCounter: {
          createIndex: 1,
        },
      },
    },
    {
      title:
        'It should build an delete_index and a create_index action ( the way we handle update )',
      context: {
        input: () => {
          const flatIndexMetadata = getFlatIndexMetadataMock({
            objectMetadataId: NOTE_FLAT_OBJECT_MOCK.id,
            universalIdentifier: 'field-metadata-unique-identifier-1',
          });
          const fromFlatObjectMetadataMaps =
            replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
              flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
              flatObjectMetadata: getFlatObjectMetadataMock({
                ...NOTE_FLAT_OBJECT_MOCK,
                flatIndexMetadatas: [flatIndexMetadata],
              }),
            });
          const toFlatObjectMetadataMaps =
            replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
              flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
              flatObjectMetadata: getFlatObjectMetadataMock({
                ...NOTE_FLAT_OBJECT_MOCK,
                flatIndexMetadatas: [
                  {
                    ...flatIndexMetadata,
                    name: 'new index name',
                    isUnique: false,
                    indexWhereClause: 'new index where clause',
                    universalIdentifier: 'field-metadata-unique-identifier-1',
                  },
                ],
              }),
            });

          return {
            fromFlatObjectMetadataMaps,
            toFlatObjectMetadataMaps,
          };
        },
        expectedActionsTypeCounter: {
          createIndex: 1,
          deleteIndex: 1,
        },
      },
    },
    {
      title: 'It should build a delete_index action',
      context: {
        input: {
          fromFlatObjectMetadataMaps:
            replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
              flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
              flatObjectMetadata: getFlatObjectMetadataMock({
                ...NOTE_FLAT_OBJECT_MOCK,
                flatIndexMetadatas: [
                  getFlatIndexMetadataMock({
                    objectMetadataId: NOTE_FLAT_OBJECT_MOCK.id,
                    universalIdentifier: 'field-metadata-unique-identifier-1',
                  }),
                ],
              }),
            }),
          toFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
        },
        expectedActionsTypeCounter: {
          deleteIndex: 1,
        },
      },
    },
    {
      title:
        'It should not infer any actions as from and to indexes are identical',
      context: {
        input: {
          fromFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          toFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
        },
      },
    },
  ];
