import { jestExpectToBeDefined } from 'test/utils/expect-to-be-defined.util.test';
import {
  EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata-maps/mocks/flat-object-metadata-maps.mock';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import {
  ExtractFlatObjectMetadataMapsOutOfFlatObjectMetadataMapsOrThrowArgs,
  extractFlatObjectMetadataMapsOutOfFlatObjectMetadataMapsOrThrow,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/extract-flat-object-metadata-maps-out-of-flat-object-metadata-maps-or-throw.util';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';
import { ROCKET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/rocket-flat-object.mock';
import { fromFlatObjectMetadatasToFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadatas-to-flat-object-metadata-maps.util';

type ExtractFlatObjectMetadataMapsTestCase = {
  input: ExtractFlatObjectMetadataMapsOutOfFlatObjectMetadataMapsOrThrowArgs;
  shouldThrow?: true;
  expected?: FlatObjectMetadataMaps;
};

describe('extractFlatObjectMetadataMapsOutOfFlatObjectMetadataMapsOrThrow', () => {
  const testCases: EachTestingContext<ExtractFlatObjectMetadataMapsTestCase>[] =
    [
      {
        title: 'should throw when object metadata id is not found',
        context: {
          input: {
            objectMetadataIds: ['non-existent-id'],
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
          shouldThrow: true,
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
          shouldThrow: true,
        },
      },
      {
        title: 'should extract single object metadata from maps',
        context: {
          input: {
            objectMetadataIds: [PET_FLAT_OBJECT_MOCK.id],
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
          expected: fromFlatObjectMetadatasToFlatObjectMetadataMaps([
            PET_FLAT_OBJECT_MOCK,
          ]),
        },
      },
      {
        title: 'should extract multiple object metadata from maps',
        context: {
          input: {
            objectMetadataIds: [
              PET_FLAT_OBJECT_MOCK.id,
              ROCKET_FLAT_OBJECT_MOCK.id,
            ],
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
          expected: fromFlatObjectMetadatasToFlatObjectMetadataMaps([
            PET_FLAT_OBJECT_MOCK,
            ROCKET_FLAT_OBJECT_MOCK,
          ]),
        },
      },
    ];

  const filteredTestCases = eachTestingContextFilter(testCases);

  it.each(filteredTestCases)(
    '$title',
    ({
      context: {
        input: { objectMetadataIds, flatObjectMetadataMaps },
        shouldThrow = false,
        expected,
      },
    }) => {
      if (shouldThrow) {
        expect(() =>
          extractFlatObjectMetadataMapsOutOfFlatObjectMetadataMapsOrThrow({
            objectMetadataIds,
            flatObjectMetadataMaps,
          }),
        ).toThrowErrorMatchingSnapshot();
      } else {
        jestExpectToBeDefined(expected);
        const result =
          extractFlatObjectMetadataMapsOutOfFlatObjectMetadataMapsOrThrow({
            objectMetadataIds,
            flatObjectMetadataMaps,
          });

        expect(result).toEqual(expected);
      }
    },
  );
});
