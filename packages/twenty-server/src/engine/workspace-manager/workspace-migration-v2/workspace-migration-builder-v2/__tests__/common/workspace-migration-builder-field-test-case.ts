import { faker } from '@faker-js/faker/.';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { getFlatFieldMetadataMock } from 'src/engine/workspace-manager/workspace-migration-v2/__tests__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/workspace-manager/workspace-migration-v2/__tests__/get-flat-object-metadata.mock';
import { WorkspaceMigrationBuilderTestCase } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/__tests__/types/workspace-migration-builder-test-case.type';
import { FieldMetadataType } from 'twenty-shared/types';

const basicObjectMetadataId = faker.string.uuid();
const basicFlatFieldMetadatas = Array.from({ length: 5 }, (_value, index) =>
  getFlatFieldMetadataMock({
    objectMetadataId: basicObjectMetadataId,
    uniqueIdentifier: `field_${index}`,
  }),
);

const relationTestCases: WorkspaceMigrationBuilderTestCase[] = [
  {
    title: 'It should build an create_field action for a RELATION field',
    context: {
      input: () => {
        const objectMetadataId = faker.string.uuid();

        const createdFlatRelationFieldMetadata = getFlatFieldMetadataMock({
          uniqueIdentifier: 'poire',
          objectMetadataId,
          type: FieldMetadataType.RELATION,
          relationTargetFieldMetadataId: faker.string.uuid(),
          relationTargetObjectMetadataId: faker.string.uuid(),
        });
        const flatObjectMetadata = getFlatObjectMetadataMock({
          uniqueIdentifier: 'pomme',
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
        total: 1,
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
          uniqueIdentifier: 'poire',
          objectMetadataId,
          type: FieldMetadataType.RELATION,
          relationTargetFieldMetadataId: faker.string.uuid(),
          relationTargetObjectMetadataId: faker.string.uuid(),
        });
        const flatObjectMetadata = getFlatObjectMetadataMock({
          uniqueIdentifier: 'pomme',
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
        total: 1,
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
        const updatedFieldMetadata =
          getFlatFieldMetadataMock<FieldMetadataType.RELATION>({
            uniqueIdentifier: 'poire',
            objectMetadataId,
            type: FieldMetadataType.RELATION,
            settings: {
              relationType: RelationType.MANY_TO_ONE,
              isForeignKey: true,
              joinColumnName: 'column-name',
              onDelete: undefined,
            },
            relationTargetFieldMetadataId: faker.string.uuid(),
            relationTargetObjectMetadataId: faker.string.uuid(),
          });
        const flatObjectMetadata = getFlatObjectMetadataMock({
          uniqueIdentifier: 'pomme',
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
      expectedActionsTypeCounter: {
        total: 0,
        updateField: 0,
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
            {
              ...flatObjectMetadata,
              flatFieldMetadatas: [flatFieldMetadata],
            },
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
    title: 'It should build an update_field action',
    context: {
      input: () => {
        const objectMetadataId = faker.string.uuid();

        const flatFieldMetadata = getFlatFieldMetadataMock({
          uniqueIdentifier: 'poire',
          objectMetadataId,
        });
        const flatObjectMetadata = getFlatObjectMetadataMock({
          uniqueIdentifier: 'pomme',
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
        total: 1,
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
          uniqueIdentifier: 'poire',
          objectMetadataId,
        });
        const flatObjectMetadata = getFlatObjectMetadataMock({
          uniqueIdentifier: 'pomme',
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
        total: 1,
        deleteField: 1,
      },
    },
  },
];

const defaultValueTestCases: WorkspaceMigrationBuilderTestCase[] = [
  {
    title:
      'It should NOT build a delete_field action on a default value updates of ',
    context: {
      input: () => {
        const objectMetadataId = faker.string.uuid();

        const flatFieldMetadata = getFlatFieldMetadataMock({
          uniqueIdentifier: 'poire',
          objectMetadataId,
        });
        const flatObjectMetadata = getFlatObjectMetadataMock({
          uniqueIdentifier: 'pomme',
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
        total: 1,
        deleteField: 1,
      },
    },
  },
];

// Could do tests cases agnostic of the field metadata type and re-genrate them for basic versus RELATION
// TODO test default value checking
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
            uniqueIdentifier: 'poire',
            objectMetadataId,
          });
          const from = [
            getFlatObjectMetadataMock({
              uniqueIdentifier: 'pomme',
              flatFieldMetadatas: [flatFieldMetadata],
            }),
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
