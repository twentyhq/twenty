import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata-maps/mocks/flat-object-metadata-maps.mock';
import { type GetSubFlatObjectMetadataMapsOrThrowArgs } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/get-sub-flat-object-metadata-maps-or-throw.util';
import { getSubFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/get-sub-flat-object-metadata-maps.util';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';

type GetSubFlatObjectMetadataMapsTestCase = {
  input: GetSubFlatObjectMetadataMapsOrThrowArgs;
};

describe('getSubFlatObjectMetadataMaps', () => {
  const testCases: EachTestingContext<GetSubFlatObjectMetadataMapsTestCase>[] =
    [
      {
        title: 'should throw when object metadata id is not found',
        context: {
          input: {
            objectMetadataIds: ['non-existent-id'],
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
        },
      },
      {
        title: 'should throw when extracting twice the same object',
        context: {
          input: {
            objectMetadataIds: [
              PET_FLAT_OBJECT_MOCK.id,
              PET_FLAT_OBJECT_MOCK.id,
            ],
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
        },
      },
    ];

  const filteredTestCases = eachTestingContextFilter(testCases);

  it.each(filteredTestCases)(
    '$title',
    ({
      context: {
        input: { objectMetadataIds, flatObjectMetadataMaps },
      },
    }) => {
      const result = getSubFlatObjectMetadataMaps({
        objectMetadataIds,
        flatObjectMetadataMaps,
      });

      expect(result).toBeUndefined();
    },
  );
});
