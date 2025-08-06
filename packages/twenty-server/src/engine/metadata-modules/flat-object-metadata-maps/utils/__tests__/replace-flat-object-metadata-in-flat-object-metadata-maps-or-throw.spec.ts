import {
  EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { expectFlatObjectMetadataToStrictlyBeInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/__tests__/utils/expect-flat-object-metadata-to-strictly-be-in-flat-object-metadata-maps.util.test';
import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata-maps/mocks/flat-object-metadata-maps.mock';
import {
  ReplaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrowArgs,
  replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/replace-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';
import { ROCKET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/rocket-flat-object.mock';
import { fromFlatObjectMetadatasToFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadatas-to-flat-object-metadata-maps.util';

type ReplaceFlatObjectMetadataInFlatObjectMetadataMapsTestCase = {
  input: ReplaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrowArgs;
  shouldThrow?: true;
};

describe('replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow', () => {
  const testCases: EachTestingContext<ReplaceFlatObjectMetadataInFlatObjectMetadataMapsTestCase>[] =
    [
      {
        title: 'should throw when object metadata to replace does not exist',
        context: {
          input: {
            flatObjectMetadata: {
              ...PET_FLAT_OBJECT_MOCK,
              id: 'non-existent',
            },
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
          shouldThrow: true,
        },
      },
      {
        title: 'should replace object metadata in flat object metadata maps',
        context: {
          input: {
            flatObjectMetadata: {
              ...PET_FLAT_OBJECT_MOCK,
              nameSingular: 'not-pet-anymore',
            },
            flatObjectMetadataMaps:
              fromFlatObjectMetadatasToFlatObjectMetadataMaps([
                PET_FLAT_OBJECT_MOCK,
                ROCKET_FLAT_OBJECT_MOCK,
              ]),
          },
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
      },
    }) => {
      if (shouldThrow) {
        expect(() =>
          replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
            flatObjectMetadata,
            flatObjectMetadataMaps,
          }),
        ).toThrowErrorMatchingSnapshot();
      } else {
        const updatedFlatObjectMetadataMaps =
          replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
            flatObjectMetadata,
            flatObjectMetadataMaps,
          });

        expectFlatObjectMetadataToStrictlyBeInFlatObjectMetadataMaps({
          flatObjectMetadata,
          flatObjectMetadataMaps: updatedFlatObjectMetadataMaps,
        });
      }
    },
  );
});
