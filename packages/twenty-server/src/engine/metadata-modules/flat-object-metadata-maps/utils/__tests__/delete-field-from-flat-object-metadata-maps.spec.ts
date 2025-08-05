import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/codegen/flat-object-metadata-maps.mock';
import { PET_FLAT_OBJECT_MOCK } from 'src/codegen/pet-flat-object.mock';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { deleteFieldFromFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-field-from-flat-object-metadata-maps.util';
import {
  EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

type DeleteFieldFromFlatObjectMetadataMapsTestCase = {
  input: {
    flatObjectMetadataMaps: FlatObjectMetadataMaps;
    fieldMetadataId: string;
    objectMetadataId: string;
  };
  expected: FlatObjectMetadataMaps;
};

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
        title: 'should return same maps when field metadata id does not exist in object',
        context: {
          input: {
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            fieldMetadataId: 'non-existent-field',
            objectMetadataId: PET_FLAT_OBJECT_MOCK.id,
          },
          expected: FLAT_OBJECT_METADATA_MAPS_MOCKS,
        },
      },
    ];

  const filteredTestCases = eachTestingContextFilter(testCases);

  it.each(filteredTestCases)('$title', ({ context: { input, expected } }) => {
    const result = deleteFieldFromFlatObjectMetadataMaps(input);

    expect(result).toEqual(expected);
  });
});
