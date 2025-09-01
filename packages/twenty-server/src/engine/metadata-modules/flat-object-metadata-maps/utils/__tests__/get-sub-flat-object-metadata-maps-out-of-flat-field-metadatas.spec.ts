import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata-maps/mocks/flat-object-metadata-maps.mock';
import { type GetSubFlatObjectMetadataMapsOfSpecificFieldsOrThrowArgs } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/get-sub-flat-object-metadata-maps-out-of-flat-field-metadatas-or-throw.util';
import { getSubFlatObjectMetadataMapsOutOfFlatFieldMetadatas } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/get-sub-flat-object-metadata-maps-out-of-flat-field-metadatas.util';

type GetSubFlatObjectMetadataMapsTestCase = {
  input: GetSubFlatObjectMetadataMapsOfSpecificFieldsOrThrowArgs;
};

describe('getSubFlatObjectMetadataMapsOutOfFlatFieldMetadatas', () => {
  const testCases: EachTestingContext<GetSubFlatObjectMetadataMapsTestCase>[] =
    [
      {
        title: 'return undefined when object metadata id is not found',
        context: {
          input: {
            flatFieldMetadatas: [
              getFlatFieldMetadataMock({
                objectMetadataId: 'non-existent',
                type: FieldMetadataType.TEXT,
                universalIdentifier: 'unique-identifier-1',
              }),
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
        input: { flatFieldMetadatas, flatObjectMetadataMaps },
      },
    }) => {
      const result = getSubFlatObjectMetadataMapsOutOfFlatFieldMetadatas({
        flatFieldMetadatas,
        flatObjectMetadataMaps,
      });

      expect(result).toBeUndefined();
    },
  );
});
