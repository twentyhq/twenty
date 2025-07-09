import { faker } from '@faker-js/faker/.';
import { getFlatObjectMetadataMock } from 'src/engine/workspace-manager/workspace-migration-v2/__tests__/get-flatten-object-metadata.mock';
import { WorkspaceMigrationBuilderTestCase } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/__tests__/common/workspace-migration-builder-test-case.type';

export const WORKSPACE_MIGRATION_FIELD_BUILDER_TEST_CASES: WorkspaceMigrationBuilderTestCase[] =
  [
    {
      title: 'It should build an create_field action',
      context: {
        input: () => {
          const objectMetadataId = faker.string.uuid();
          const flattenObjectMetadata = getFlatObjectMetadataMock({
            uniqueIdentifier: 'pomme',
            isLabelSyncedWithName: true,
            flatFieldMetadatas: [],
            id: objectMetadataId,
          });
          const flattenFieldMetadata = getFlatFieldMetadata({
            uniqueIdentifier: 'poire',
            objectMetadataId,
          });

          return {
            from: [flattenObjectMetadata],
            to: [
              getFlatObjectMetadataMock({
                ...flattenObjectMetadata,
                flatFieldMetadatas: [flattenFieldMetadata],
              }),
            ],
          };
        },
        expectedActionsTypeCounter: {
          total: 1,
          createField: 1,
        },
      },
    },
    {
      title: 'It should build an create_field action',
      context: {
        input: () => {
          const objectMetadataId = faker.string.uuid();

          const flattenFieldMetadata = getFlatFieldMetadata({
            uniqueIdentifier: 'poire',
            objectMetadataId,
          });
          const flattenObjectMetadata = getFlatObjectMetadataMock({
            uniqueIdentifier: 'pomme',
            isLabelSyncedWithName: true,
            flatFieldMetadatas: [],
          });

          return {
            from: [flattenObjectMetadata],
            to: [
              getFlatObjectMetadataMock({
                ...flattenObjectMetadata,
                flatFieldMetadatas: [flattenFieldMetadata],
              }),
            ],
          };
        },
        expectedActionsTypeCounter: {
          total: 1,
          createField: 1,
        },
      },
    },
  ];
