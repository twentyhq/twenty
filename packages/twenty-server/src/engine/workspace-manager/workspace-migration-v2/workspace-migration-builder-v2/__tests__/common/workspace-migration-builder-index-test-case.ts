import { faker } from '@faker-js/faker';

import { getFlatIndexMetadataMock } from 'src/engine/metadata-modules/flat-index-metadata/__mocks__/get-flat-index-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { WorkspaceMigrationBuilderTestCase } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/__tests__/types/workspace-migration-builder-test-case.type';

// Should test more things such as flatFieldIndex diffing
const objectMetadataId = faker.string.uuid();

export const WORKSPACE_MIGRATION_INDEX_BUILDER_TEST_CASES: WorkspaceMigrationBuilderTestCase[] =
  [
    {
      title: 'It should build an create_index action',
      context: {
        input: () => {
          const flatIndexMetadata = getFlatIndexMetadataMock({
            uniqueIdentifier: 'field-metadata-unique-identifier-1',
            objectMetadataId,
          });
          const flatObjectMetadata = getFlatObjectMetadataMock({
            uniqueIdentifier: 'object-metadata-unique-identifier-1',
            isLabelSyncedWithName: true,
            flatIndexMetadatas: [],
          });

          return {
            from: [flatObjectMetadata],
            to: [
              {
                ...flatObjectMetadata,
                flatIndexMetadatas: [flatIndexMetadata],
              },
            ],
          };
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
            uniqueIdentifier: 'field-metadata-unique-identifier-1',
            objectMetadataId,
          });
          const flatObjectMetadata = getFlatObjectMetadataMock({
            uniqueIdentifier: 'object-metadata-unique-identifier-1',
            isLabelSyncedWithName: true,
            flatIndexMetadatas: [flatIndexMetadata],
          });

          return {
            from: [flatObjectMetadata],
            to: [
              {
                ...flatObjectMetadata,
                flatIndexMetadatas: [
                  {
                    ...flatIndexMetadata,
                    name: 'new index name',
                    isUnique: false,
                    indexWhereClause: 'new index where clause',
                  },
                ],
              },
            ],
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
        input: () => {
          const flatIndexMetadata = getFlatIndexMetadataMock({
            uniqueIdentifier: 'field-metadata-unique-identifier-1',
            objectMetadataId,
          });
          const flatObjectMetadata = getFlatObjectMetadataMock({
            uniqueIdentifier: 'object-metadata-unique-identifier-1',
            isLabelSyncedWithName: true,
            flatIndexMetadatas: [flatIndexMetadata],
          });

          return {
            from: [flatObjectMetadata],
            to: [
              {
                ...flatObjectMetadata,
                flatIndexMetadatas: [],
              },
            ],
          };
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
        input: () => {
          const flatIndexMetadata = getFlatIndexMetadataMock({
            uniqueIdentifier: 'field-metadata-unique-identifier-1',
            objectMetadataId,
          });
          const flatObjectMetadata = getFlatObjectMetadataMock({
            uniqueIdentifier: 'object-metadata-unique-identifier-1',
            isLabelSyncedWithName: true,
            flatIndexMetadatas: [flatIndexMetadata],
          });

          return {
            from: [flatObjectMetadata],
            to: [flatObjectMetadata],
          };
        },
      },
    },
  ];
