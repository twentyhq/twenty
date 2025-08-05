import {
  EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/codegen/flat-object-metadata-maps.mock';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import {
  DispatchAndAddFlatFieldMetadataInFlatObjectMetadataMapsArgs,
  dispatchAndAddFlatFieldMetadataInFlatObjectMetadataMaps,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/dispatch-and-add-flat-field-metadata-in-flat-object-metadata-maps.util';

type DispatchAndAddFlatFieldMetadataInFlatObjectMetadataMapsTestCase = {
  input: DispatchAndAddFlatFieldMetadataInFlatObjectMetadataMapsArgs;
  expected: ReturnType<
    typeof dispatchAndAddFlatFieldMetadataInFlatObjectMetadataMaps
  >;
};

describe('dispatchAndAddFlatFieldMetadataInFlatObjectMetadataMaps', () => {
  const testCases: EachTestingContext<DispatchAndAddFlatFieldMetadataInFlatObjectMetadataMapsTestCase>[] =
    [
      {
        title: 'should return same maps when object metadata id does not exist',
        context: {
          input: {
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            flatFieldMetadata: getFlatFieldMetadataMock({
              objectMetadataId: 'non-existent',
              type: FieldMetadataType.TEXT,
              uniqueIdentifier: 'unique-id-1',
              id: 'unique-id-1',
            }),
          },
          expected: undefined,
        },
      },
    ];

  const filteredTestCases = eachTestingContextFilter(testCases);

  it.each(filteredTestCases)('$title', ({ context: { input, expected } }) => {
    const result =
      dispatchAndAddFlatFieldMetadataInFlatObjectMetadataMaps(input);

    expect(result).toEqual(expected);
  });
});
