import { faker } from '@faker-js/faker';
import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatIndexMetadataMock } from 'src/engine/metadata-modules/flat-index-metadata/__mocks__/get-flat-index-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { WorkspaceMigrationBuilderTestCase } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/__tests__/types/workspace-migration-builder-test-case.type';

export const WORKSPACE_MIGRATION_OBJECT_BUILDER_TEST_CASES: WorkspaceMigrationBuilderTestCase[] =
  [
    {
      title:
        'It should build an update_object action with all object updated fields',
      context: {
        input: () => {
          const flatObjectMetadata = getFlatObjectMetadataMock({
            uniqueIdentifier: 'pomme',
            nameSingular: 'toto',
            namePlural: 'totos',
            isLabelSyncedWithName: true,
          });

          return {
            from: [flatObjectMetadata],
            to: [
              {
                ...flatObjectMetadata,
                nameSingular: 'prastouin',
                namePlural: 'prastoins',
                isLabelSyncedWithName: false,
              },
            ],
          };
        },
        expectedActionsTypeCounter: {
          updateObject: 1,
        },
      },
    },
    {
      title: 'It should build a create_object action',
      context: {
        input: () => {
          const flatObjectMetadata = getFlatObjectMetadataMock({
            uniqueIdentifier: 'pomme',
            nameSingular: 'toto',
            namePlural: 'totos',
            isLabelSyncedWithName: true,
          });

          return {
            from: [],
            to: [flatObjectMetadata],
          };
        },
        expectedActionsTypeCounter: {
          createObject: 1,
        },
      },
    },
    {
      title:
        'It should build a create_object and create_field and create_index actions for each of this fieldMetadata',
      context: {
        input: () => {
          const objectMetadataId = faker.string.uuid();
          const flatFieldMetadatas = Array.from(
            { length: 5 },
            (_value, index) =>
              getFlatFieldMetadataMock({
                type: FieldMetadataType.TEXT,
                objectMetadataId,
                uniqueIdentifier: `field_${index}`,
              }),
          );
          const flatIndexMetadata = getFlatIndexMetadataMock({
            uniqueIdentifier: 'field-metadata-unique-identifier-1',
            objectMetadataId,
          });
          const flatObjectMetadata = getFlatObjectMetadataMock({
            uniqueIdentifier: 'pomme',
            nameSingular: 'toto',
            namePlural: 'totos',
            isLabelSyncedWithName: true,
            id: objectMetadataId,
            flatFieldMetadatas,
            flatIndexMetadatas: [flatIndexMetadata],
          });

          return {
            from: [],
            to: [flatObjectMetadata],
          };
        },

        expectedActionsTypeCounter: {
          createObject: 1,
          createField: 0,
          createIndex: 1,
        },
      },
    },
    {
      title: 'It should build a delete_object action',
      context: {
        input: () => {
          const flatObjectMetadata = getFlatObjectMetadataMock({
            uniqueIdentifier: 'pomme',
            nameSingular: 'toto',
            namePlural: 'totos',
            isLabelSyncedWithName: true,
          });

          return {
            from: [flatObjectMetadata],
            to: [],
          };
        },
        expectedActionsTypeCounter: {
          deleteObject: 1,
        },
      },
    },
    {
      title: 'It should not infer any actions as from and to are identical',
      context: {
        input: () => {
          const from = [
            getFlatObjectMetadataMock({ uniqueIdentifier: 'pomme' }),
          ];

          return {
            from,
            to: from,
          };
        },
      },
    },
  ];
