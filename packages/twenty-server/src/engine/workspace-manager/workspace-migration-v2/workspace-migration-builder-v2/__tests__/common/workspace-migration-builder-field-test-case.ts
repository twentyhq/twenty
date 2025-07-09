import { faker } from '@faker-js/faker/.';
import { getFlatObjectMetadataMock } from 'src/engine/workspace-manager/workspace-migration-v2/__tests__/get-flat-object-metadata.mock';
import { WorkspaceMigrationBuilderTestCase } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/__tests__/common/workspace-migration-builder-test-case.type';

export const WORKSPACE_MIGRATION_FIELD_BUILDER_TEST_CASES: WorkspaceMigrationBuilderTestCase[] =
  [
    {
      title: 'It should build an create_field action',
      context: {
        input: () => {
          const objectMetadataId = faker.string.uuid();
          const flatObjectMetadata = getFlatObjectMetadataMock({
            uniqueIdentifier: 'pomme',
            isLabelSyncedWithName: true,
            flatFieldMetadatas: [],
            id: objectMetadataId,
          });
          const flatFieldMetadata = getFlatFieldMetadata({
            uniqueIdentifier: 'poire',
            objectMetadataId,
          });

          return {
            from: [flatObjectMetadata],
            to: [
              getFlatObjectMetadataMock({
                ...flatObjectMetadata,
                flatFieldMetadatas: [flatFieldMetadata],
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

          const flatFieldMetadata = getFlatFieldMetadata({
            uniqueIdentifier: 'poire',
            objectMetadataId,
          });
          const flatObjectMetadata = getFlatObjectMetadataMock({
            uniqueIdentifier: 'pomme',
            isLabelSyncedWithName: true,
            flatFieldMetadatas: [],
          });

          return {
            from: [flatObjectMetadata],
            to: [
              getFlatObjectMetadataMock({
                ...flatObjectMetadata,
                flatFieldMetadatas: [flatFieldMetadata],
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
