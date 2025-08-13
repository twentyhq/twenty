import { faker } from '@faker-js/faker';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { COMPANY_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/company-flat-fields.mock';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { OPPORTUNITY_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/opportunity-flat-fields.mock';
import { PET_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/pet-flat-fields.mock';
import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata-maps/mocks/flat-object-metadata-maps.mock';
import { addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { deleteFieldFromFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-field-from-flat-object-metadata-maps-or-throw.util';
import { replaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/replace-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';
import { ROCKET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/rocket-flat-object.mock';
import { type WorkspaceMigrationBuilderTestCase } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/__tests__/types/workspace-migration-builder-test-case.type';

// TODO prastoin test defaultValue and settings updates
// TODO prastoin test standard abstraction in TDD style

const relationTestCases: WorkspaceMigrationBuilderTestCase[] = [
  {
    title: 'It should build an create_field action for a RELATION field',
    context: {
      input: () => {
        const createdFlatRelationFieldMetadata = getFlatFieldMetadataMock({
          uniqueIdentifier: 'field-metadata-unique-identifier-1',
          objectMetadataId: PET_FLAT_OBJECT_MOCK.id,
          type: FieldMetadataType.RELATION,
          relationTargetFieldMetadataId: faker.string.uuid(),
          relationTargetObjectMetadataId: faker.string.uuid(),
          flatRelationTargetFieldMetadata: getFlatFieldMetadataMock({
            objectMetadataId: COMPANY_FLAT_OBJECT_MOCK.id,
            type: FieldMetadataType.RELATION,
            uniqueIdentifier: 'field-metadata-unique-identifier-2',
          }),
          flatRelationTargetObjectMetadata: getFlatObjectMetadataMock({
            uniqueIdentifier: 'object-metadata-unique-identifier-2',
          }),
        });

        return {
          fromFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          toFlatObjectMetadataMaps:
            addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
              flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
              flatFieldMetadata: createdFlatRelationFieldMetadata,
            }),
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
      input: {
        fromFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
        toFlatObjectMetadataMaps:
          replaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
            flatFieldMetadata: getFlatFieldMetadataMock({
              ...PET_FLAT_FIELDS_MOCK.species,
              description: 'new description',
              label: 'new label',
            }),
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          }),
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
      input: {
        fromFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
        toFlatObjectMetadataMaps:
          replaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
            flatFieldMetadata: getFlatFieldMetadataMock({
              ...COMPANY_FLAT_FIELDS_MOCK.opportunities,
              settings: {
                relationType: RelationType.MANY_TO_ONE,
                joinColumnName: 'new-column-name',
                onDelete: undefined,
              },
              name: 'newName',
              relationTargetFieldMetadataId: faker.string.uuid(),
              relationTargetObjectMetadataId: faker.string.uuid(),
            }),
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          }),
      },
    },
  },
];

const basicCrudTestCases: WorkspaceMigrationBuilderTestCase[] = [
  {
    title: 'It should build an create_field action',
    context: {
      input: {
        fromFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
        toFlatObjectMetadataMaps:
          addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
            flatFieldMetadata: getFlatFieldMetadataMock({
              uniqueIdentifier: 'field-metadata-unique-identifier-1',
              type: FieldMetadataType.TEXT,
              objectMetadataId: ROCKET_FLAT_OBJECT_MOCK.id,
            }),
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          }),
      },
      expectedActionsTypeCounter: {
        createField: 1,
      },
    },
  },
  {
    title: 'It should build an update_field action for standard field',
    context: {
      input: {
        fromFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
        toFlatObjectMetadataMaps:
          replaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            flatFieldMetadata: getFlatFieldMetadataMock({
              ...OPPORTUNITY_FLAT_FIELDS_MOCK.stage,
              standardOverrides: {
                description: 'new description',
                icon: 'new icon',
              },
            }),
          }),
      },
      expectedActionsTypeCounter: {
        updateField: 1,
      },
    },
  },
  {
    title: 'It should build an update_field action for custom fields',
    context: {
      input: {
        fromFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
        toFlatObjectMetadataMaps:
          replaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            flatFieldMetadata: getFlatFieldMetadataMock({
              ...PET_FLAT_FIELDS_MOCK.species,
              description: 'new description',
              icon: 'new icon',
            }),
          }),
      },
      expectedActionsTypeCounter: {
        updateField: 1,
      },
    },
  },
  {
    title: 'It should build a delete_field action',
    context: {
      input: {
        fromFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
        toFlatObjectMetadataMaps: deleteFieldFromFlatObjectMetadataMapsOrThrow({
          fieldMetadataId: PET_FLAT_FIELDS_MOCK.species.id,
          objectMetadataId: PET_FLAT_FIELDS_MOCK.species.objectMetadataId,
          flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
        }),
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
        input: {
          fromFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          toFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
        },
      },
    },
  ];
