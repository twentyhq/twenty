import fs from 'fs';
import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/codegen/flat-object-metadata-maps.mock';
import { PET_FLAT_OBJECT_MOCK } from 'src/codegen/pet-flat-object.mock';
import { ROCKET_FLAT_OBJECT_MOCK } from 'src/codegen/rocket-flat-object.mock';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { mergeFlatFieldMetadatasInFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/merge-flat-field-metadatas-in-flat-object-metadata.util';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatObjectMetadataToFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-to-flat-object-metadata-maps.util';
import { deleteFieldFromFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-field-from-flat-object-metadata-maps.util';
import { fromFlatObjectMetadatasToFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadatas-to-flat-object-metadata-maps.util';
import {
  EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

type DeleteFieldFromFlatObjectMetadataMapsTestCase = {
  input: {
    flatObjectMetadataMaps: FlatObjectMetadataMaps;
    fieldMetadataId: string;
    objectMetadataId: string;
  };
  expected: FlatObjectMetadataMaps;
};

const FLAT_OBJECT_METADATA_MAPS_MOCKS_WITH_ROCKET_AND_PET =
  fromFlatObjectMetadatasToFlatObjectMetadataMaps([
    PET_FLAT_OBJECT_MOCK,
    ROCKET_FLAT_OBJECT_MOCK,
  ]);
const fieldMetadataToRemoveId = 'field-metadata-id';
const newCustomField = getFlatFieldMetadataMock({
  objectMetadataId: PET_FLAT_OBJECT_MOCK.id,
  type: FieldMetadataType.TEXT,
  uniqueIdentifier: fieldMetadataToRemoveId,
  id: fieldMetadataToRemoveId,
});

describe('deleteFieldFromFlatObjectMetadataMaps', () => {
  const testCases: EachTestingContext<DeleteFieldFromFlatObjectMetadataMapsTestCase>[] =
    [
      {
        title: 'should return same maps when object metadata id does not exist',
        context: {
          input: {
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            fieldMetadataId: 'field-1',
            objectMetadataId: 'non-existent',
          },
          expected: FLAT_OBJECT_METADATA_MAPS_MOCKS,
        },
      },
      {
        title:
          'should return same maps when field metadata id does not exist in object',
        context: {
          input: {
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            fieldMetadataId: 'non-existent-field',
            objectMetadataId: PET_FLAT_OBJECT_MOCK.id,
          },
          expected: FLAT_OBJECT_METADATA_MAPS_MOCKS,
        },
      },
      {
        title: 'should delete species field from pet object',
        context: {
          input: {
            flatObjectMetadataMaps:
              addFlatObjectMetadataToFlatObjectMetadataMaps({
                flatObjectMetadata: mergeFlatFieldMetadatasInFlatObjectMetadata(
                  {
                    flatFieldMetadatas: [newCustomField],
                    flatObjectMetadata: PET_FLAT_OBJECT_MOCK,
                  },
                ),
                flatObjectMetadataMaps:
                  FLAT_OBJECT_METADATA_MAPS_MOCKS_WITH_ROCKET_AND_PET,
              }),
            fieldMetadataId: fieldMetadataToRemoveId,
            objectMetadataId: PET_FLAT_OBJECT_MOCK.id,
          },
          expected: FLAT_OBJECT_METADATA_MAPS_MOCKS_WITH_ROCKET_AND_PET,
        },
      },
    ];

  const filteredTestCases = eachTestingContextFilter(testCases);

  it.each(filteredTestCases)('$title', ({ context: { input, expected } }) => {
    const result = deleteFieldFromFlatObjectMetadataMaps(input);

    fs.writeFileSync('result.json', JSON.stringify(result));
    expect(result).toEqual(expected);
  });
});
