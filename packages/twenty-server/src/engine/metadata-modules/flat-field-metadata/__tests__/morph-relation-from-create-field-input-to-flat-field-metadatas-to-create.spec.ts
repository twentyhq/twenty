import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { type EachTestingContext } from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  fromCreateFieldInputToFlatFieldMetadatasToCreate,
  type FromCreateFieldInputToFlatObjectMetadataArgs,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/from-create-field-input-to-flat-field-metadatas-to-create.util';
import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/flat-object-metadata-maps.mock';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';
import { ROCKET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/rocket-flat-object.mock';

const MOCK_FLAT_APPLICATION: FlatApplication = {
  id: '20202020-81ee-42da-a281-668632f32fe7',
  universalIdentifier: '20202020-81ee-42da-a281-668632f32fe7',
  name: 'Workspace Custom Application',
  description: null,
  workspaceId: 'workspace-id',
  version: null,
  sourceType: 'local',
  sourcePath: '',
  packageJsonChecksum: null,
  packageJsonFileId: null,
  yarnLockChecksum: null,
  yarnLockFileId: null,
  availablePackages: {},
  logicFunctionLayerId: null,
  defaultRoleId: null,
  defaultRole: null,
  canBeUninstalled: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const flatObjectMetadataMaps = [
  COMPANY_FLAT_OBJECT_MOCK,
  ROCKET_FLAT_OBJECT_MOCK,
  PET_FLAT_OBJECT_MOCK,
].reduce((flatObjectMetadataMaps, flatObjectMetadata) => {
  return addFlatEntityToFlatEntityMapsOrThrow({
    flatEntity: flatObjectMetadata,
    flatEntityMaps: flatObjectMetadataMaps,
  });
}, createEmptyFlatEntityMaps());

const emptyFlatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> =
  createEmptyFlatEntityMaps();

type TestCase = EachTestingContext<{
  input: FromCreateFieldInputToFlatObjectMetadataArgs;
  expected: 'success' | 'fail';
}>;

describe('fromCreateFieldInputToFlatFieldMetadatasToCreate MORPH_RELATION test suite', () => {
  describe('Success cases', () => {
    const successTestCases: TestCase[] = [
      {
        title:
          'should create morph relation field metadata with valid input on rocket object to pet object',
        context: {
          input: {
            flatApplication: MOCK_FLAT_APPLICATION,
            createFieldInput: {
              name: 'newField',
              label: 'newFieldLabel',
              description: 'new field description',
              type: FieldMetadataType.MORPH_RELATION,
              objectMetadataId: ROCKET_FLAT_OBJECT_MOCK.id,
              morphRelationsCreationPayload: [
                {
                  type: RelationType.ONE_TO_MANY,
                  targetObjectMetadataId: PET_FLAT_OBJECT_MOCK.id,
                  targetFieldLabel: 'Pet',
                  targetFieldIcon: 'IconPet',
                },
                {
                  type: RelationType.ONE_TO_MANY,
                  targetObjectMetadataId: COMPANY_FLAT_OBJECT_MOCK.id,
                  targetFieldLabel: 'Company',
                  targetFieldIcon: 'IconBuilding',
                },
              ],
            },
            flatObjectMetadataMaps,
            flatFieldMetadataMaps: emptyFlatFieldMetadataMaps,
          },
          expected: 'success',
        },
      },
    ];

    test.each(successTestCases)(
      '$title',
      async ({ context: { input, expected } }) => {
        const result =
          await fromCreateFieldInputToFlatFieldMetadatasToCreate(input);

        expect(result.status).toEqual(expected);
        if (result.status !== 'success') {
          throw new Error('Should never occur, typecheck');
        }
        jestExpectToBeDefined(
          input.createFieldInput.morphRelationsCreationPayload,
        );
        expect(result.result.flatFieldMetadatas.length).toBe(
          input.createFieldInput.morphRelationsCreationPayload.length * 2,
        );
        expect(result).toMatchSnapshot(
          extractRecordIdsAndDatesAsExpectAny(result),
        );
      },
    );
  });

  describe('Failure cases', () => {
    const failureTestCases: TestCase[] = [
      {
        title: 'should fail when morphRelationsCreationPayload is missing',
        context: {
          input: {
            flatApplication: MOCK_FLAT_APPLICATION,
            createFieldInput: {
              name: 'newField',
              label: 'newFieldLabel',
              description: 'new field description',
              type: FieldMetadataType.MORPH_RELATION,
              objectMetadataId: ROCKET_FLAT_OBJECT_MOCK.id,
              morphRelationsCreationPayload: undefined as any,
            },
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            flatFieldMetadataMaps: emptyFlatFieldMetadataMaps,
          },
          expected: 'fail',
        },
      },
      {
        title: 'should fail when morphRelationsCreationPayload is empty array',
        context: {
          input: {
            flatApplication: MOCK_FLAT_APPLICATION,
            createFieldInput: {
              name: 'newField',
              label: 'newFieldLabel',
              description: 'new field description',
              type: FieldMetadataType.MORPH_RELATION,
              objectMetadataId: ROCKET_FLAT_OBJECT_MOCK.id,
              morphRelationsCreationPayload: [],
            },
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            flatFieldMetadataMaps: emptyFlatFieldMetadataMaps,
          },
          expected: 'fail',
        },
      },
      {
        title:
          'should fail when morphRelationsCreationPayload has different relation types',
        context: {
          input: {
            flatApplication: MOCK_FLAT_APPLICATION,
            createFieldInput: {
              name: 'newField',
              label: 'newFieldLabel',
              description: 'new field description',
              type: FieldMetadataType.MORPH_RELATION,
              objectMetadataId: ROCKET_FLAT_OBJECT_MOCK.id,
              morphRelationsCreationPayload: [
                {
                  type: RelationType.ONE_TO_MANY,
                  targetObjectMetadataId: PET_FLAT_OBJECT_MOCK.id,
                  targetFieldLabel: 'Pet',
                  targetFieldIcon: 'IconPet',
                },
                {
                  type: RelationType.MANY_TO_ONE,
                  targetObjectMetadataId: COMPANY_FLAT_OBJECT_MOCK.id,
                  targetFieldLabel: 'Company',
                  targetFieldIcon: 'IconPet',
                },
              ],
            },
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            flatFieldMetadataMaps: emptyFlatFieldMetadataMaps,
          },
          expected: 'fail',
        },
      },
      {
        title:
          'should fail when morphRelationsCreationPayload has several references to same object metadata',
        context: {
          input: {
            flatApplication: MOCK_FLAT_APPLICATION,
            createFieldInput: {
              name: 'newField',
              label: 'newFieldLabel',
              description: 'new field description',
              type: FieldMetadataType.MORPH_RELATION,
              objectMetadataId: ROCKET_FLAT_OBJECT_MOCK.id,
              morphRelationsCreationPayload: [
                {
                  type: RelationType.MANY_TO_ONE,
                  targetObjectMetadataId: PET_FLAT_OBJECT_MOCK.id,
                  targetFieldLabel: 'Pet',
                  targetFieldIcon: 'IconPet',
                },
                {
                  type: RelationType.MANY_TO_ONE,
                  targetObjectMetadataId: PET_FLAT_OBJECT_MOCK.id,
                  targetFieldLabel: 'Pet',
                  targetFieldIcon: 'IconPet',
                },
              ],
            },
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            flatFieldMetadataMaps: emptyFlatFieldMetadataMaps,
          },
          expected: 'fail',
        },
      },
      {
        title:
          'should fail when morphRelationsCreationPayload has invalid relation payload',
        context: {
          input: {
            flatApplication: MOCK_FLAT_APPLICATION,
            createFieldInput: {
              name: 'newField',
              label: 'newFieldLabel',
              description: 'new field description',
              type: FieldMetadataType.MORPH_RELATION,
              objectMetadataId: ROCKET_FLAT_OBJECT_MOCK.id,
              morphRelationsCreationPayload: [
                {
                  type: RelationType.ONE_TO_MANY,
                  targetObjectMetadataId: PET_FLAT_OBJECT_MOCK.id,
                  // Missing required fields
                } as any,
              ],
            },
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            flatFieldMetadataMaps: emptyFlatFieldMetadataMaps,
          },
          expected: 'fail',
        },
      },
      {
        title: 'should fail when target object metadata is not found',
        context: {
          input: {
            flatApplication: MOCK_FLAT_APPLICATION,
            createFieldInput: {
              name: 'newField',
              label: 'newFieldLabel',
              description: 'new field description',
              type: FieldMetadataType.MORPH_RELATION,
              objectMetadataId: ROCKET_FLAT_OBJECT_MOCK.id,
              morphRelationsCreationPayload: [
                {
                  type: RelationType.ONE_TO_MANY,
                  targetObjectMetadataId: 'non-existent-id',
                  targetFieldLabel: 'Pet',
                  targetFieldIcon: 'IconPet',
                },
              ],
            },
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            flatFieldMetadataMaps: emptyFlatFieldMetadataMaps,
          },
          expected: 'fail',
        },
      },
    ];

    test.each(failureTestCases)(
      '$title',
      async ({ context: { input, expected } }) => {
        const result =
          await fromCreateFieldInputToFlatFieldMetadatasToCreate(input);

        expect(result.status).toEqual(expected);
        expect(result).toMatchSnapshot(
          extractRecordIdsAndDatesAsExpectAny(result),
        );
      },
    );
  });
});
