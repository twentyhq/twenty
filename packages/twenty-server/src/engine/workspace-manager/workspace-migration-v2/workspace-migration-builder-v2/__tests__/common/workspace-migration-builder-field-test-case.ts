import { faker } from '@faker-js/faker';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { WorkspaceMigrationBuilderTestCase } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/__tests__/types/workspace-migration-builder-test-case.type';

const basicObjectMetadataId = faker.string.uuid();
const basicFlatFieldMetadatas = Array.from({ length: 5 }, (_value, index) =>
  getFlatFieldMetadataMock({
    objectMetadataId: basicObjectMetadataId,
    uniqueIdentifier: `field_${index}`,
    type: FieldMetadataType.TEXT,
  }),
);

// TODO prastoin test defaultValue and settings updates
// TODO prastoin test standard abstraction in TDD style

const relationTestCases: WorkspaceMigrationBuilderTestCase[] = [
  {
    title: 'It should build an create_field action for a RELATION field',
    context: {
      input: () => {
        const objectMetadataId = faker.string.uuid();
        const targetObjectMetadataId = faker.string.uuid();
        const createdFlatRelationFieldMetadata = getFlatFieldMetadataMock({
          uniqueIdentifier: 'field-metadata-unique-identifier-1',
          objectMetadataId,
          type: FieldMetadataType.RELATION,
          relationTargetFieldMetadataId: faker.string.uuid(),
          relationTargetObjectMetadataId: faker.string.uuid(),
          flatRelationTargetFieldMetadata: getFlatFieldMetadataMock({
            objectMetadataId: targetObjectMetadataId,
            type: FieldMetadataType.RELATION,
            uniqueIdentifier: 'field-metadata-unique-identifier-2',
          }),
          flatRelationTargetObjectMetadata: getFlatObjectMetadataMock({
            uniqueIdentifier: 'object-metadata-unique-identifier-2',
          }),
        });
        const flatObjectMetadata = getFlatObjectMetadataMock({
          uniqueIdentifier: 'object-metadata-unique-identifier-1',
          isLabelSyncedWithName: true,
          flatFieldMetadatas: [],
        });

        return {
          from: [flatObjectMetadata],
          to: [
            {
              ...flatObjectMetadata,
              flatFieldMetadatas: [createdFlatRelationFieldMetadata],
            },
          ],
        };
      },
      expectedActionsTypeCounter: {
        createField: 1,
      },
    },
  },
  {
    title: 'It should build an update_field action for a RELATION field',
    context: {
      input: () => {
        const objectMetadataId = faker.string.uuid();

        const updatedFieldMetadata = getFlatFieldMetadataMock({
          uniqueIdentifier: 'field-metadata-unique-identifier-1',
          objectMetadataId,
          type: FieldMetadataType.RELATION,
          relationTargetFieldMetadataId: faker.string.uuid(),
          relationTargetObjectMetadataId: faker.string.uuid(),
        });
        const flatObjectMetadata = getFlatObjectMetadataMock({
          uniqueIdentifier: 'object-metadata-unique-identifier-1',
          isLabelSyncedWithName: true,
          flatFieldMetadatas: [
            ...basicFlatFieldMetadatas,
            updatedFieldMetadata,
          ],
        });

        return {
          from: [flatObjectMetadata],
          to: [
            {
              ...flatObjectMetadata,
              flatFieldMetadatas: [
                ...basicFlatFieldMetadatas,
                {
                  ...updatedFieldMetadata,
                  isActive: false,
                  description: 'new description',
                  label: 'new label',
                },
              ],
            },
          ],
        };
      },
      expectedActionsTypeCounter: {
        updateField: 1,
      },
    },
  },
  {
    title:
      'It should NOT build an update_field action for a field RELATION uncovered fields mutation',
    context: {
      input: () => {
        const objectMetadataId = faker.string.uuid();
        const updatedFieldMetadata = getFlatFieldMetadataMock({
          uniqueIdentifier: 'field-metadata-unique-identifier-1',
          objectMetadataId,
          type: FieldMetadataType.RELATION,
          settings: {
            relationType: RelationType.MANY_TO_ONE,
            joinColumnName: 'column-name',
            onDelete: undefined,
          },
          relationTargetFieldMetadataId: faker.string.uuid(),
          relationTargetObjectMetadataId: faker.string.uuid(),
        });
        const flatObjectMetadata = getFlatObjectMetadataMock({
          uniqueIdentifier: 'object-metadata-unique-identifier-1',
          isLabelSyncedWithName: true,
          flatFieldMetadatas: [updatedFieldMetadata],
        });

        return {
          from: [flatObjectMetadata],
          to: [
            {
              ...flatObjectMetadata,
              flatFieldMetadatas: [
                {
                  ...updatedFieldMetadata,
                  settings: {
                    relationType: RelationType.ONE_TO_MANY,
                    isForeignKey: false,
                    joinColumnName: 'new-column-name',
                    onDelete: undefined,
                  },
                  relationTargetFieldMetadataId: faker.string.uuid(),
                  relationTargetObjectMetadataId: faker.string.uuid(),
                },
              ],
            },
          ],
        };
      },
    },
  },
];

const basicCrudTestCases: WorkspaceMigrationBuilderTestCase[] = [
  {
    title: 'It should build an create_field action',
    context: {
      input: () => {
        const objectMetadataId = faker.string.uuid();

        const flatFieldMetadata = getFlatFieldMetadataMock({
          uniqueIdentifier: 'field-metadata-unique-identifier-1',
          type: FieldMetadataType.TEXT,
          objectMetadataId,
        });
        const flatObjectMetadata = getFlatObjectMetadataMock({
          uniqueIdentifier: 'object-metadata-unique-identifier-1',
          isLabelSyncedWithName: true,
          flatFieldMetadatas: [],
        });

        return {
          from: [flatObjectMetadata],
          to: [
            {
              ...flatObjectMetadata,
              flatFieldMetadatas: [flatFieldMetadata],
            },
          ],
        };
      },
      expectedActionsTypeCounter: {
        createField: 1,
      },
    },
  },
  {
    title: 'It should build an update_field action',
    context: {
      input: () => {
        const objectMetadataId = faker.string.uuid();

        const flatFieldMetadata = getFlatFieldMetadataMock({
          uniqueIdentifier: 'field-metadata-unique-identifier-1',
          type: FieldMetadataType.TEXT,
          objectMetadataId,
        });
        const flatObjectMetadata = getFlatObjectMetadataMock({
          uniqueIdentifier: 'object-metadata-unique-identifier-1',
          flatFieldMetadatas: [...basicFlatFieldMetadatas, flatFieldMetadata],
        });

        return {
          from: [flatObjectMetadata],
          to: [
            {
              ...flatObjectMetadata,
              flatFieldMetadatas: [
                ...basicFlatFieldMetadatas,
                {
                  ...flatFieldMetadata,
                  description: 'new description',
                  name: 'new name',
                  isActive: false,
                  icon: 'new icon',
                },
              ],
            },
          ],
        };
      },
      expectedActionsTypeCounter: {
        updateField: 1,
      },
    },
  },
  {
    title: 'It should build a delete_field action',
    context: {
      input: () => {
        const objectMetadataId = faker.string.uuid();

        const flatFieldMetadata = getFlatFieldMetadataMock({
          uniqueIdentifier: 'field-metadata-unique-identifier-1',
          type: FieldMetadataType.TEXT,
          objectMetadataId,
        });
        const flatObjectMetadata = getFlatObjectMetadataMock({
          uniqueIdentifier: 'object-metadata-unique-identifier-1',
          flatFieldMetadatas: [...basicFlatFieldMetadatas, flatFieldMetadata],
        });

        return {
          from: [flatObjectMetadata],
          to: [
            {
              ...flatObjectMetadata,
              flatFieldMetadatas: basicFlatFieldMetadatas,
            },
          ],
        };
      },
      expectedActionsTypeCounter: {
        deleteField: 1,
      },
    },
  },
];

export const WORKSPACE_MIGRATION_FIELD_BUILDER_TEST_CASES: WorkspaceMigrationBuilderTestCase[] =
  [
    ...relationTestCases,
    ...basicCrudTestCases,
    {
      title:
        'It should not infer any actions as from and to fields are identical',
      context: {
        input: () => {
          const objectMetadataId = faker.string.uuid();
          const flatFieldMetadata = getFlatFieldMetadataMock({
            uniqueIdentifier: 'field-metadata-unique-identifier-1',
            type: FieldMetadataType.TEXT,
            objectMetadataId,
          });
          const from = [
            getFlatObjectMetadataMock({
              uniqueIdentifier: 'object-metadata-unique-identifier-1',
              flatFieldMetadatas: [flatFieldMetadata],
            }),
          ];

          return {
            from,
            to: from,
          };
        },
      },
    },
  ];
