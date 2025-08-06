import {
  EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata-maps/mocks/flat-object-metadata-maps.mock';
import {
  FindFlatObjectMetadataInFlatObjectMetadataMapsArgs,
  findFlatObjectMetadataInFlatObjectMetadataMaps,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps.util';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type FindFlatObjectMetadataInFlatObjectMetadataMapsTestCase = {
  input: FindFlatObjectMetadataInFlatObjectMetadataMapsArgs;
  expected?: FlatObjectMetadata;
};

describe('findFlatObjectMetadataInFlatObjectMetadataMaps', () => {
  const testCases: EachTestingContext<FindFlatObjectMetadataInFlatObjectMetadataMapsTestCase>[] =
    [
      {
        title: 'should return undefined when object metadata does not exist',
        context: {
          input: {
            objectMetadataId: 'non-existent',
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
        },
      },
      {
        title: 'should find object metadata in flat object metadata maps',
        context: {
          input: {
            objectMetadataId: PET_FLAT_OBJECT_MOCK.id,
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
          expected: PET_FLAT_OBJECT_MOCK,
        },
      },
    ];

  const filteredTestCases = eachTestingContextFilter(testCases);

  it.each(filteredTestCases)(
    '$title',
    ({
      context: {
        input: { objectMetadataId, flatObjectMetadataMaps },
        expected,
      },
    }) => {
      const result = findFlatObjectMetadataInFlatObjectMetadataMaps({
        objectMetadataId,
        flatObjectMetadataMaps,
      });

      expect(result).toEqual(expected);
    },
  );
});
