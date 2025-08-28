import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { type EachTestingContext } from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { fromCreateFieldInputToFlatFieldMetadatasToCreate } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-create-field-input-to-flat-field-metadatas-to-create.util';
import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata-maps/mocks/flat-object-metadata-maps.mock';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/replace-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';
import { ROCKET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/rocket-flat-object.mock';

const existingFlatObjectMetadataMaps = [
  COMPANY_FLAT_OBJECT_MOCK,
  ROCKET_FLAT_OBJECT_MOCK,
  PET_FLAT_OBJECT_MOCK,
].reduce((flatObjectMetadataMaps, flatObjectMetadata) => {
  return replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
    flatObjectMetadata: {
      ...flatObjectMetadata,
      flatFieldMetadatas: [],
    },
    flatObjectMetadataMaps,
  });
}, FLAT_OBJECT_METADATA_MAPS_MOCKS);

type TestCase = EachTestingContext<{
  input: {
    rawCreateFieldInput: CreateFieldInput &
      Required<Pick<CreateFieldInput, 'morphRelationsCreationPayload'>>;
    workspaceId: string;
    existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  };
  expected: 'success' | 'fail';
}>;

describe('fromCreateFieldInputToFlatFieldMetadatasToCreate MORPH_RELATION test suite', () => {
  const mockWorkspaceId = 'mock-workspace-id';

  describe('Success cases', () => {
    const successTestCases: TestCase[] = [
      {
        title:
          'should create morph relation field metadata with valid input on rocket object to pet object',
        context: {
          input: {
            rawCreateFieldInput: {
              name: 'newField',
              label: 'newFieldLabel',
              description: 'new field description',
              type: FieldMetadataType.MORPH_RELATION,
              objectMetadataId: ROCKET_FLAT_OBJECT_MOCK.id,
              workspaceId: mockWorkspaceId,
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
            workspaceId: mockWorkspaceId,
            existingFlatObjectMetadataMaps,
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
        expect(result.result.length).toBe(
          input.rawCreateFieldInput.morphRelationsCreationPayload.length * 2,
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
            rawCreateFieldInput: {
              name: 'newField',
              label: 'newFieldLabel',
              description: 'new field description',
              type: FieldMetadataType.MORPH_RELATION,
              objectMetadataId: ROCKET_FLAT_OBJECT_MOCK.id,
              workspaceId: mockWorkspaceId,
              morphRelationsCreationPayload: undefined as any,
            },
            workspaceId: mockWorkspaceId,
            existingFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
          expected: 'fail',
        },
      },
      {
        title: 'should fail when morphRelationsCreationPayload is empty array',
        context: {
          input: {
            rawCreateFieldInput: {
              name: 'newField',
              label: 'newFieldLabel',
              description: 'new field description',
              type: FieldMetadataType.MORPH_RELATION,
              objectMetadataId: ROCKET_FLAT_OBJECT_MOCK.id,
              workspaceId: mockWorkspaceId,
              morphRelationsCreationPayload: [],
            },
            workspaceId: mockWorkspaceId,
            existingFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
          expected: 'fail',
        },
      },
      {
        title:
          'should fail when morphRelationsCreationPayload has different relation types',
        context: {
          input: {
            rawCreateFieldInput: {
              name: 'newField',
              label: 'newFieldLabel',
              description: 'new field description',
              type: FieldMetadataType.MORPH_RELATION,
              objectMetadataId: ROCKET_FLAT_OBJECT_MOCK.id,
              workspaceId: mockWorkspaceId,
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
                  targetFieldLabel: 'Pet',
                  targetFieldIcon: 'IconPet',
                },
              ],
            },
            workspaceId: mockWorkspaceId,
            existingFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
          expected: 'fail',
        },
      },
      {
        title:
          'should fail when morphRelationsCreationPayload has several references to same object metadata',
        context: {
          input: {
            rawCreateFieldInput: {
              name: 'newField',
              label: 'newFieldLabel',
              description: 'new field description',
              type: FieldMetadataType.MORPH_RELATION,
              objectMetadataId: ROCKET_FLAT_OBJECT_MOCK.id,
              workspaceId: mockWorkspaceId,
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
            workspaceId: mockWorkspaceId,
            existingFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
          expected: 'fail',
        },
      },
      {
        title:
          'should fail when morphRelationsCreationPayload has invalid relation payload',
        context: {
          input: {
            rawCreateFieldInput: {
              name: 'newField',
              label: 'newFieldLabel',
              description: 'new field description',
              type: FieldMetadataType.MORPH_RELATION,
              objectMetadataId: ROCKET_FLAT_OBJECT_MOCK.id,
              workspaceId: mockWorkspaceId,
              morphRelationsCreationPayload: [
                {
                  type: RelationType.ONE_TO_MANY,
                  targetObjectMetadataId: PET_FLAT_OBJECT_MOCK.id,
                  // Missing required fields
                } as any,
              ],
            },
            workspaceId: mockWorkspaceId,
            existingFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
          expected: 'fail',
        },
      },
      {
        title: 'should fail when target object metadata is not found',
        context: {
          input: {
            rawCreateFieldInput: {
              name: 'newField',
              label: 'newFieldLabel',
              description: 'new field description',
              type: FieldMetadataType.MORPH_RELATION,
              objectMetadataId: ROCKET_FLAT_OBJECT_MOCK.id,
              workspaceId: mockWorkspaceId,
              morphRelationsCreationPayload: [
                {
                  type: RelationType.ONE_TO_MANY,
                  targetObjectMetadataId: 'non-existent-id',
                  targetFieldLabel: 'Pet',
                  targetFieldIcon: 'IconPet',
                },
              ],
            },
            workspaceId: mockWorkspaceId,
            existingFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
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
