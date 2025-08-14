import { jestExpectToBeDefined } from 'test/utils/expect-to-be-defined.util.test';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { PET_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/pet-flat-fields.mock';
import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata-maps/mocks/flat-object-metadata-maps.mock';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import {
  getSubFlatObjectMetadataMapsOrThrow,
  type GetSubFlatObjectMetadataMapsOrThrowArgs,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/get-sub-flat-object-metadata-maps-or-throw.util';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';
import { ROCKET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/rocket-flat-object.mock';
import { fromFlatObjectMetadatasToFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadatas-to-flat-object-metadata-maps.util';

type GetSubObjectMetadataMapsOrThrowTestCase = {
  input: GetSubFlatObjectMetadataMapsOrThrowArgs;
  shouldThrow?: true;
  expected?: FlatObjectMetadataMaps;
};

describe('getSubFlatObjectMetadataMapsOrThrow', () => {
  const testCases: EachTestingContext<GetSubObjectMetadataMapsOrThrowTestCase>[] =
    [
      {
        title: 'should throw when object metadata id is not found',
        context: {
          input: {
            objectMetadataAndFieldIds: [
              { objectMetadataId: 'non-existent-id' },
            ],
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
          shouldThrow: true,
        },
      },
      {
        title: 'should throw when extracting twice the same object',
        context: {
          input: {
            objectMetadataAndFieldIds: [
              { objectMetadataId: PET_FLAT_OBJECT_MOCK.id },
              { objectMetadataId: PET_FLAT_OBJECT_MOCK.id },
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
            objectMetadataAndFieldIds: [
              { objectMetadataId: PET_FLAT_OBJECT_MOCK.id },
            ],
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
            objectMetadataAndFieldIds: [
              { objectMetadataId: PET_FLAT_OBJECT_MOCK.id },
              { objectMetadataId: ROCKET_FLAT_OBJECT_MOCK.id },
            ],
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
          expected: fromFlatObjectMetadatasToFlatObjectMetadataMaps([
            PET_FLAT_OBJECT_MOCK,
            ROCKET_FLAT_OBJECT_MOCK,
          ]),
        },
      },
      {
        title: 'should extract object metadata from maps without any fields',
        context: {
          input: {
            objectMetadataAndFieldIds: [
              {
                objectMetadataId: PET_FLAT_OBJECT_MOCK.id,
                fieldMetadataIds: [],
              },
              {
                objectMetadataId: ROCKET_FLAT_OBJECT_MOCK.id,
                fieldMetadataIds: [],
              },
            ],
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
          expected: fromFlatObjectMetadatasToFlatObjectMetadataMaps([
            { ...PET_FLAT_OBJECT_MOCK, flatFieldMetadatas: [] },
            { ...ROCKET_FLAT_OBJECT_MOCK, flatFieldMetadatas: [] },
          ]),
        },
      },
      {
        only: true,
        title:
          'should extract object metadata from maps without provided fields',
        context: {
          input: {
            objectMetadataAndFieldIds: [
              {
                objectMetadataId: PET_FLAT_OBJECT_MOCK.id,
                fieldMetadataIds: [
                  PET_FLAT_FIELDS_MOCK.species.id,
                  PET_FLAT_FIELDS_MOCK.name.id,
                ],
              },
            ],
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
          expected: fromFlatObjectMetadatasToFlatObjectMetadataMaps([
            {
              ...PET_FLAT_OBJECT_MOCK,
              flatFieldMetadatas: [
                PET_FLAT_FIELDS_MOCK.species,
                PET_FLAT_FIELDS_MOCK.name,
              ],
            },
          ]),
        },
      },
    ];

  const filteredTestCases = eachTestingContextFilter(testCases);

  it.each(filteredTestCases)(
    '$title',
    ({
      context: {
        input: {
          objectMetadataAndFieldIds: objectMetadataIds,
          flatObjectMetadataMaps,
        },
        shouldThrow = false,
        expected,
      },
    }) => {
      if (shouldThrow) {
        expect(() =>
          getSubFlatObjectMetadataMapsOrThrow({
            objectMetadataAndFieldIds: objectMetadataIds,
            flatObjectMetadataMaps,
          }),
        ).toThrowErrorMatchingSnapshot();
      } else {
        jestExpectToBeDefined(expected);
        const result = getSubFlatObjectMetadataMapsOrThrow({
          objectMetadataAndFieldIds: objectMetadataIds,
          flatObjectMetadataMaps,
        });

        expect(result).toEqual(expected);
      }
    },
  );
});
