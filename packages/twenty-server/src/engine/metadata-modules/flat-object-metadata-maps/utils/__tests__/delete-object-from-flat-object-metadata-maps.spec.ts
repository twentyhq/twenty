import {
    EachTestingContext,
    eachTestingContextFilter,
} from 'twenty-shared/testing';

import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata-maps/mocks/flat-object-metadata-maps.mock';
import { deleteObjectFromFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-object-from-flat-object-metadata-maps.util';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';
import { ROCKET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/rocket-flat-object.mock';
import { fromFlatObjectMetadatasToFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadatas-to-flat-object-metadata-maps.util';
import { isDefined } from 'twenty-shared/utils';

type DeleteObjectFromFlatObjectMetadataMapsTestCase = {
  input: {
    flatObjectMetadataMaps: ReturnType<typeof fromFlatObjectMetadatasToFlatObjectMetadataMaps>;
    objectMetadataId: string;
  };
  expected:
    | ((
        arg: ReturnType<typeof deleteObjectFromFlatObjectMetadataMaps>,
      ) => void)
    | undefined;
};

const FLAT_OBJECT_METADATA_MAPS_MOCKS_WITH_ROCKET_AND_PET =
  fromFlatObjectMetadatasToFlatObjectMetadataMaps([
    PET_FLAT_OBJECT_MOCK,
    ROCKET_FLAT_OBJECT_MOCK,
  ]);

describe('deleteObjectFromFlatObjectMetadataMaps', () => {
  const testCases: EachTestingContext<DeleteObjectFromFlatObjectMetadataMapsTestCase>[] =
    [
      {
        title: 'should return undefined when object metadata id does not exist',
        context: {
          input: {
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            objectMetadataId: 'non-existent',
          },
          expected: undefined,
        },
      },
    ];

  const filteredTestCases = eachTestingContextFilter(testCases);

  it.each(filteredTestCases)('$title', ({ context: { input, expected } }) => {
    const result = deleteObjectFromFlatObjectMetadataMaps(input);

    if (isDefined(expected)) {
      expected(result);
    } else {
      expect(result).toEqual(expected);
    }
  });
});
