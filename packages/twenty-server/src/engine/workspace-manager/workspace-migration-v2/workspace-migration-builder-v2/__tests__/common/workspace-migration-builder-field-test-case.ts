import { faker } from '@faker-js/faker/.';
import { getFlattenFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/__tests__/get-flatten-field-metadata.mock';
import { getFlattenObjectMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/__tests__/get-flatten-object-metadata.mock';
import { WorkspaceMigrationBuilderTestCase } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/__tests__/common/workspace-migration-builder-test-case.type';

export const WORKSPACE_MIGRATION_FIELD_BUILDER_TEST_CASES: WorkspaceMigrationBuilderTestCase[] =
  [
    {
      title: 'It should build an create_field action',
      context: {
        input: () => {
          const objectMetadataId = faker.string.uuid();
          const flattenObjectMetadata = getFlattenObjectMetadata({
            uniqueIdentifier: 'pomme',
            isLabelSyncedWithName: true,
            flattenFieldMetadatas: [],
            id: objectMetadataId,
          });
          const flattenFieldMetadata = getFlattenFieldMetadata({
            uniqueIdentifier: 'poire',
            objectMetadataId,
          });

          return {
            from: [flattenObjectMetadata],
            to: [
              getFlattenObjectMetadata({
                ...flattenObjectMetadata,
                flattenFieldMetadatas: [flattenFieldMetadata],
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

          const flattenFieldMetadata = getFlattenFieldMetadata({
            uniqueIdentifier: 'poire',
            objectMetadataId,
          });
          const flattenObjectMetadata = getFlattenObjectMetadata({
            uniqueIdentifier: 'pomme',
            isLabelSyncedWithName: true,
            flattenFieldMetadatas: [],
          });

          return {
            from: [flattenObjectMetadata],
            to: [
              getFlattenObjectMetadata({
                ...flattenObjectMetadata,
                flattenFieldMetadatas: [flattenFieldMetadata],
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
