import { FieldMetadataType } from 'twenty-shared/types';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { FieldInputTranspilationResult } from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { fromCreateFieldInputToFlatFieldMetadatasToCreate } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-create-field-input-to-flat-field-metadatas-to-create.util';
import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata-maps/mocks/flat-object-metadata-maps.mock';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/replace-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';
import { ROCKET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/rocket-flat-object.mock';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { EachTestingContext } from 'twenty-shared/testing';

describe('fromCreateFieldInputToFlatFieldMetadatasToCreate', () => {
  const mockWorkspaceId = 'mock-workspace-id';
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

  const testCases: EachTestingContext<{
    input: {
      rawCreateFieldInput: CreateFieldInput &
        Required<Pick<CreateFieldInput, 'morphRelationsCreationPayload'>>;
      workspaceId: string;
      existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
    };
    expected: Partial<FieldInputTranspilationResult<FlatFieldMetadata[]>>;
  }>[] = [
    {
      only: true,
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
                targetFieldIcon: 'IconBuilding',
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
        expected: {
          status: 'success',
        },
      },
    },
  ];

  test.each(testCases)('$title', async ({ context: { input, expected } }) => {
    const result =
      await fromCreateFieldInputToFlatFieldMetadatasToCreate(input);
    console.log(result);
    expect(result.status).toEqual(expected.status);
    if (expected.status === 'success' && result.status === 'success') {
      expect(result.result.length).toBe(
        input.rawCreateFieldInput.morphRelationsCreationPayload.length * 2,
      );
      expect(result).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(result),
      );
    } else {
      expect(result).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(result),
      );
    }
  });
});
