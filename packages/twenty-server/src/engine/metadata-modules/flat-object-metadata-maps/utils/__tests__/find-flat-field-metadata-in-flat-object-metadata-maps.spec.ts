import {
  EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { PET_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/pet-flat-fields.mock';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata-maps/mocks/flat-object-metadata-maps.mock';
import {
  FindFlatFieldMetadataInFlatObjectMetadataMapsArgs,
  findFlatFieldMetadataInFlatObjectMetadataMaps,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-field-metadata-in-flat-object-metadata-maps.util';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';

type FindFlatFieldMetadataInFlatObjectMetadataMapsTestCase = {
  input: FindFlatFieldMetadataInFlatObjectMetadataMapsArgs;
  expected?: FlatFieldMetadata;
};

describe('findFlatFieldMetadataInFlatObjectMetadataMaps', () => {
  const testCases: EachTestingContext<FindFlatFieldMetadataInFlatObjectMetadataMapsTestCase>[] =
    [
      {
        title: 'should return undefined when object metadata does not exist',
        context: {
          input: {
            fieldMetadataId: PET_FLAT_FIELDS_MOCK.species.id,
            objectMetadataId: 'non-existent',
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
        },
      },
      {
        title: 'should return undefined when field metadata does not exist',
        context: {
          input: {
            fieldMetadataId: 'non-existent',
            objectMetadataId: PET_FLAT_OBJECT_MOCK.id,
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
        },
      },
      {
        title: 'should find field metadata in flat object metadata maps',
        context: {
          input: {
            fieldMetadataId: PET_FLAT_FIELDS_MOCK.species.id,
            objectMetadataId: PET_FLAT_OBJECT_MOCK.id,
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          },
          expected: PET_FLAT_FIELDS_MOCK.species,
        },
      },
    ];

  const filteredTestCases = eachTestingContextFilter(testCases);

  it.each(filteredTestCases)(
    '$title',
    ({
      context: {
        input: { fieldMetadataId, objectMetadataId, flatObjectMetadataMaps },
        expected,
      },
    }) => {
      const findResult = findFlatFieldMetadataInFlatObjectMetadataMaps({
        fieldMetadataId,
        objectMetadataId,
        flatObjectMetadataMaps,
      });

      expect(findResult).toEqual(expected);
    },
  );
});
