import { jestExpectToBeDefined } from 'test/utils/expect-to-be-defined.util.test';
import {
  EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata-maps/mocks/flat-object-metadata-maps.mock';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-to-flat-object-metadata-maps-or-throw.util';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';
import { ROCKET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/rocket-flat-object.mock';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromFlatObjectMetadatasToFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadatas-to-flat-object-metadata-maps.util';

type AddFlatObjectMetadataToFlatObjectMetadataMapsTestCase = {
  input: {
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatObjectMetadataMaps;
  };
  shouldThrow?: true;
  expected?: FlatObjectMetadataMaps;
};

describe('addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow', () => {
  const testCases: EachTestingContext<AddFlatObjectMetadataToFlatObjectMetadataMapsTestCase>[] =
    [
      {
        title: 'should throw when object metadata to add already exists',
        context: {
          input: {
            flatObjectMetadata: PET_FLAT_OBJECT_MOCK,
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
          shouldThrow: true,
        },
      },
      {
        title: 'should add object to flat object metadata maps',
        context: {
          input: {
            flatObjectMetadata: ROCKET_FLAT_OBJECT_MOCK,
            flatObjectMetadataMaps:
              fromFlatObjectMetadatasToFlatObjectMetadataMaps([
                PET_FLAT_OBJECT_MOCK,
              ]),
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
        input: { flatObjectMetadata, flatObjectMetadataMaps },
        shouldThrow = false,
        expected,
      },
    }) => {
      if (shouldThrow) {
        expect(() =>
          addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow({
            flatObjectMetadata,
            flatObjectMetadataMaps,
          }),
        ).toThrowErrorMatchingSnapshot();
      } else {
        jestExpectToBeDefined(expected);
        const updatedFlatObjectMetadataMaps =
          addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow({
            flatObjectMetadata,
            flatObjectMetadataMaps,
          });

        expect(updatedFlatObjectMetadataMaps).toEqual(expected);
      }
    },
  );
});
