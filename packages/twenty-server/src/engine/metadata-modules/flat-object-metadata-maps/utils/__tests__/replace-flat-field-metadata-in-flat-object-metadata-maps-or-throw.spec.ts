import {
  EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { PET_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/pet-flat-fields.mock';
import { expectFlatFieldMetadataToBeInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/__tests__/utils/expect-flat-field-metadata-to-be-in-flat-object-metadata-maps.util.test';
import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata-maps/mocks/flat-object-metadata-maps.mock';
import {
  ReplaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrowArgs,
  replaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrow,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/replace-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';
import { ROCKET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/rocket-flat-object.mock';
import { fromFlatObjectMetadatasToFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadatas-to-flat-object-metadata-maps.util';

type ReplaceFlatFieldMetadataInFlatObjectMetadataMapsTestCase = {
  input: ReplaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrowArgs;
  shouldThrow?: true;
};

describe('replaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrow', () => {
  const testCases: EachTestingContext<ReplaceFlatFieldMetadataInFlatObjectMetadataMapsTestCase>[] =
    [
      {
        title: 'should throw when field metadata to replace does not exist',
        context: {
          input: {
            flatFieldMetadata: getFlatFieldMetadataMock({
              objectMetadataId: ROCKET_FLAT_OBJECT_MOCK.id,
              type: FieldMetadataType.TEXT,
              uniqueIdentifier: 'unique-identifier-1',
              id: 'non-existent',
            }),
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
          shouldThrow: true,
        },
      },
      {
        title: 'should throw when field metadata parent object does not exist',
        context: {
          input: {
            flatFieldMetadata: getFlatFieldMetadataMock({
              ...PET_FLAT_FIELDS_MOCK.species,
              objectMetadataId: 'non-existent',
            }),
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
          shouldThrow: true,
        },
      },
      {
        title: 'should replace field metadata in flat object metadata maps',
        context: {
          input: {
            flatFieldMetadata: getFlatFieldMetadataMock({
              ...PET_FLAT_FIELDS_MOCK.species,
              name: 'not-species-anymore',
            }),
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
        input: { flatFieldMetadata, flatObjectMetadataMaps },
        shouldThrow = false,
      },
    }) => {
      if (shouldThrow) {
        expect(() =>
          replaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
            flatFieldMetadata,
            flatObjectMetadataMaps,
          }),
        ).toThrowErrorMatchingSnapshot();
      } else {
        const updatedFlatObjectMetadataMaps =
          replaceFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
            flatFieldMetadata,
            flatObjectMetadataMaps,
          });

        expectFlatFieldMetadataToBeInFlatObjectMetadataMaps({
          flatFieldMetadata,
          flatObjectMetadataMaps: updatedFlatObjectMetadataMaps,
        });
      }
    },
  );
});
