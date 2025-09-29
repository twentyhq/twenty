import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { PET_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/pet-flat-fields.mock';
import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata-maps/mocks/flat-object-metadata-maps.mock';
import { type AddFlatFieldMetadataInFlatObjectMetadataMapsOrThrowArgs } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { addFlatFieldMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-field-metadata-in-flat-object-metadata-maps.util';

type AddFlatFieldMetadataInFlatObjectMetadataMapsArgsTestCase = {
  input: AddFlatFieldMetadataInFlatObjectMetadataMapsOrThrowArgs;
};

describe('addFlatFieldMetadataInFlatObjectMetadataMaps', () => {
  const testCases: EachTestingContext<AddFlatFieldMetadataInFlatObjectMetadataMapsArgsTestCase>[] =
    [
      {
        title:
          'should return undefined when field metadata parent object metadata does not exist',
        context: {
          input: {
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            flatFieldMetadata: getFlatFieldMetadataMock({
              objectMetadataId: 'non-existent',
              type: FieldMetadataType.TEXT,
              universalIdentifier: 'unique-id-1',
              id: 'unique-id-1',
            }),
          },
        },
      },
      {
        title:
          'should return undefined when field metadata to add already exist in object',
        context: {
          input: {
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            flatFieldMetadata: PET_FLAT_FIELDS_MOCK.species,
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
      },
    }) => {
      const updatedFlatObjectMetadataMaps =
        addFlatFieldMetadataInFlatObjectMetadataMaps({
          flatFieldMetadata,
          flatObjectMetadataMaps,
        });

      expect(updatedFlatObjectMetadataMaps).toBeUndefined();
    },
  );
});
