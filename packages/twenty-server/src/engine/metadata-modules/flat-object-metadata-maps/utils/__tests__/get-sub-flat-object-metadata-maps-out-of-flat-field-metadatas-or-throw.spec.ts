import { jestExpectToBeDefined } from 'test/utils/expect-to-be-defined.util.test';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { PET_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/pet-flat-fields.mock';
import { ROCKET_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/rocket-flat-fields.mock';
import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata-maps/mocks/flat-object-metadata-maps.mock';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import {
  type GetSubFlatObjectMetadataMapsOfSpecificFieldsOrThrowArgs,
  getSubFlatObjectMetadataMapsOutOfFlatFieldMetadatasOrThrow,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/get-sub-flat-object-metadata-maps-out-of-flat-field-metadatas-or-throw.util';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';
import { ROCKET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/rocket-flat-object.mock';
import { fromFlatObjectMetadatasToFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadatas-to-flat-object-metadata-maps.util';

type GetSubObjectMetadataMapsOrThrowTestCase = {
  input: GetSubFlatObjectMetadataMapsOfSpecificFieldsOrThrowArgs;
  shouldThrow?: true;
  expected?: FlatObjectMetadataMaps;
};

describe('getSubFlatObjectMetadataMapsOutOfFlatFieldMetadatasOrThrow', () => {
  const testCases: EachTestingContext<GetSubObjectMetadataMapsOrThrowTestCase>[] =
    [
      {
        title: 'should throw when object metadata id is not found',
        context: {
          input: {
            flatFieldMetadatas: [
              getFlatFieldMetadataMock({
                objectMetadataId: 'non-existent',
                type: FieldMetadataType.TEXT,
                uniqueIdentifier: 'unique-identifier-1',
              }),
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
            flatFieldMetadatas: [PET_FLAT_FIELDS_MOCK.species],
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
          expected: fromFlatObjectMetadatasToFlatObjectMetadataMaps([
            {
              ...PET_FLAT_OBJECT_MOCK,
              flatFieldMetadatas: [PET_FLAT_FIELDS_MOCK.species],
            },
          ]),
        },
      },
      {
        title: 'should extract object metadata from maps with provided fields',
        context: {
          input: {
            flatFieldMetadatas: [
              PET_FLAT_FIELDS_MOCK.species,
              PET_FLAT_FIELDS_MOCK.name,
              ROCKET_FLAT_FIELDS_MOCK.attachments,
            ],
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
          expected: fromFlatObjectMetadatasToFlatObjectMetadataMaps([
            {
              ...PET_FLAT_OBJECT_MOCK,
              flatFieldMetadatas: [
                PET_FLAT_FIELDS_MOCK.name,
                PET_FLAT_FIELDS_MOCK.species,
              ],
            },
            {
              ...ROCKET_FLAT_OBJECT_MOCK,
              flatFieldMetadatas: [ROCKET_FLAT_FIELDS_MOCK.attachments],
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
        input: { flatFieldMetadatas, flatObjectMetadataMaps },
        shouldThrow = false,
        expected,
      },
    }) => {
      if (shouldThrow) {
        expect(() =>
          getSubFlatObjectMetadataMapsOutOfFlatFieldMetadatasOrThrow({
            flatFieldMetadatas,
            flatObjectMetadataMaps,
          }),
        ).toThrowErrorMatchingSnapshot();
      } else {
        jestExpectToBeDefined(expected);
        const result =
          getSubFlatObjectMetadataMapsOutOfFlatFieldMetadatasOrThrow({
            flatFieldMetadatas,
            flatObjectMetadataMaps,
          });

        expect(result).toEqual(expected);
      }
    },
  );
});
