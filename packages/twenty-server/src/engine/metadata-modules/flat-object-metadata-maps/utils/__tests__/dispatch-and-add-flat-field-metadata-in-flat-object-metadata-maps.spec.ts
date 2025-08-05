import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/codegen/flat-object-metadata-maps.mock';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { dispatchAndAddFlatFieldMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/dispatch-and-add-flat-field-metadata-in-flat-object-metadata-maps.util';
import {
    EachTestingContext,
    eachTestingContextFilter,
} from 'twenty-shared/testing';

type DispatchAndAddFlatFieldMetadataInFlatObjectMetadataMapsTestCase = {
  input: {
    flatObjectMetadataMaps: FlatObjectMetadataMaps;
    flatFieldMetadata: FlatFieldMetadata;
    objectMetadataId: string;
  };
  expected: FlatObjectMetadataMaps;
};

describe('dispatchAndAddFlatFieldMetadataInFlatObjectMetadataMaps', () => {
  const testCases: EachTestingContext<DispatchAndAddFlatFieldMetadataInFlatObjectMetadataMapsTestCase>[] =
    [
      {
        title: 'should return same maps when object metadata id does not exist',
        context: {
          input: {
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            flatFieldMetadata: {} as FlatFieldMetadata,
            objectMetadataId: 'non-existent',
          },
          expected: FLAT_OBJECT_METADATA_MAPS_MOCKS,
        },
      },
    ];

  const filteredTestCases = eachTestingContextFilter(testCases);

  it.each(filteredTestCases)('$title', ({ context: { input, expected } }) => {
    const result = dispatchAndAddFlatFieldMetadataInFlatObjectMetadataMaps(input);

    expect(result).toEqual(expected);
  });
});
