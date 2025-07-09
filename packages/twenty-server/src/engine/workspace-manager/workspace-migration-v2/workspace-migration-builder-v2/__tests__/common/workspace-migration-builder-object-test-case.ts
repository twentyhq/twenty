import { faker } from '@faker-js/faker/.';
import { getFlattenFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/__tests__/get-flatten-field-metadata.mock';
import { getFlattenObjectMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/__tests__/get-flatten-object-metadata.mock';
import { WorkspaceMigrationBuilderTestCase } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/__tests__/common/workspace-migration-builder-test-case.type';

export const WORKSPACE_MIGRATION_OBJECT_BUILDER_TEST_CASES: WorkspaceMigrationBuilderTestCase[] =
  [
    {
      title:
        'It should build an update_object action with all object updated fields',
      context: {
        input: () => {
          const flattenObjectMetadata = getFlattenObjectMetadata({
            uniqueIdentifier: 'pomme',
            nameSingular: 'toto',
            namePlural: 'totos',
            isLabelSyncedWithName: true,
          });
          return {
            from: [flattenObjectMetadata],
            to: [
              {
                ...flattenObjectMetadata,
                nameSingular: 'prastouin',
                namePlural: 'prastoins',
                isLabelSyncedWithName: false,
              },
            ],
          };
        },
        expectedActionsTypeCounter: {
          total: 1,
          updateObject: 1,
        },
      },
    },
    {
      title: 'It should build a create_object action',
      context: {
        input: () => {
          const flattenObjectMetadata = getFlattenObjectMetadata({
            uniqueIdentifier: 'pomme',
            nameSingular: 'toto',
            namePlural: 'totos',
            isLabelSyncedWithName: true,
          });
          return {
            from: [],
            to: [flattenObjectMetadata],
          };
        },
        expectedActionsTypeCounter: {
          total: 1,
          createObject: 1,
        },
      },
    },
    {
      title:
        'It should build a create_object and create_field actions for each of this fieldMetadata',
      context: {
        input: () => {
          const objectMetadataId = faker.string.uuid();
          const flattenFieldMetadatas = Array.from(
            { length: 5 },
            (_value, index) =>
              getFlattenFieldMetadata({
                objectMetadataId,
                uniqueIdentifier: `field_${index}`,
              }),
          );
          const flattenObjectMetadata = getFlattenObjectMetadata({
            uniqueIdentifier: 'pomme',
            nameSingular: 'toto',
            namePlural: 'totos',
            isLabelSyncedWithName: true,
            id: objectMetadataId,
            flattenFieldMetadatas,
          });

          return {
            from: [],
            to: [flattenObjectMetadata],
          };
        },

        expectedActionsTypeCounter: {
          total: 1,
          createObject: 1,
          createField: 5,
        },
      },
    },
    {
      title: 'It should build a delete_object action',
      context: {
        input: () => {
          const flattenObjectMetadata = getFlattenObjectMetadata({
            uniqueIdentifier: 'pomme',
            nameSingular: 'toto',
            namePlural: 'totos',
            isLabelSyncedWithName: true,
          });
          return {
            from: [flattenObjectMetadata],
            to: [],
          };
        },
        expectedActionsTypeCounter: {
          total: 1,
          deleteObject: 1,
        },
      },
    },
    {
      title: 'It should not infer any actions as from and to are identical',
      context: {
        input: () => {
          const from = [
            getFlattenObjectMetadata({ uniqueIdentifier: 'pomme' }),
          ];
          return {
            from,
            to: from,
          };
        },
        expectedActionsTypeCounter: {
          total: 0,
        },
      },
    },
  ];
