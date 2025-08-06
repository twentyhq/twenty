import {
  EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata-maps/mocks/flat-object-metadata-maps.mock';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import {
  DeleteObjectFromFlatObjectMetadataMapsOrThrowArgs,
  deleteObjectFromFlatObjectMetadataMapsOrThrow,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-object-from-flat-object-metadata-maps-or-throw.util';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';
import { ROCKET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/rocket-flat-object.mock';
import { fromFlatObjectMetadatasToFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadatas-to-flat-object-metadata-maps.util';

type DeleteObjectFromFlatObjectMetadataMapsTestCase = {
  input: DeleteObjectFromFlatObjectMetadataMapsOrThrowArgs;
  shouldThrow?: true;
  expected?: FlatObjectMetadataMaps;
};

describe('deleteObjectFromFlatObjectMetadataMapsOrThrow', () => {
  const testCases: EachTestingContext<DeleteObjectFromFlatObjectMetadataMapsTestCase>[] =
    [
      {
        title: 'should throw when object metadata to delete does not exist',
        context: {
          input: {
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            objectMetadataId: 'non-existent',
          },
          shouldThrow: true,
        },
      },
      {
        title: 'should delete object from flat object metadata maps',
        context: {
          input: {
            flatObjectMetadataMaps:
              fromFlatObjectMetadatasToFlatObjectMetadataMaps([
                PET_FLAT_OBJECT_MOCK,
                ROCKET_FLAT_OBJECT_MOCK,
              ]),
            objectMetadataId: ROCKET_FLAT_OBJECT_MOCK.id,
          },
          expected: fromFlatObjectMetadatasToFlatObjectMetadataMaps([
            PET_FLAT_OBJECT_MOCK,
          ]),
        },
      },
    ];

  const filteredTestCases = eachTestingContextFilter(testCases);

  it.each(filteredTestCases)(
    '$title',
    ({ context: { input, expected, shouldThrow = false } }) => {
      if (shouldThrow) {
        expect(() =>
          deleteObjectFromFlatObjectMetadataMapsOrThrow(input),
        ).toThrowErrorMatchingSnapshot();
      } else {
        const updatedFlatObjectMetadataMaps =
          deleteObjectFromFlatObjectMetadataMapsOrThrow(input);

        expect(updatedFlatObjectMetadataMaps).toEqual(expected);
      }
    },
  );
});
