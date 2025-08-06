import {
  EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { jestExpectToBeDefined } from 'src/engine/metadata-modules/flat-object-metadata-maps/__tests__/utils/expect-to-be-defined.util';
import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata-maps/mocks/flat-object-metadata-maps.mock';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { deleteFieldFromFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-field-from-flat-object-metadata-maps.util';
import { dispatchAndAddFlatFieldMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/dispatch-and-add-flat-field-metadata-in-flat-object-metadata-maps.util';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';
import { ROCKET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/rocket-flat-object.mock';
import { fromFlatObjectMetadatasToFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadatas-to-flat-object-metadata-maps.util';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';

type DeleteFieldFromFlatObjectMetadataMapsTestCase = {
  input: {
    flatObjectMetadataMaps: FlatObjectMetadataMaps | undefined;
    fieldMetadataId: string;
    objectMetadataId: string;
  };
  expected: FlatObjectMetadataMaps;
};

const FLAT_OBJECT_METADATA_MAPS_MOCKS_WITH_ROCKET_AND_PET =
  fromFlatObjectMetadatasToFlatObjectMetadataMaps([
    PET_FLAT_OBJECT_MOCK,
    ROCKET_FLAT_OBJECT_MOCK,
  ]);
const fieldMetadataToRemoveId = 'field-metadata-id';
const newCustomRelationFlatFieldMetadata = getFlatFieldMetadataMock({
  objectMetadataId: PET_FLAT_OBJECT_MOCK.id,
  type: FieldMetadataType.RELATION,
  uniqueIdentifier: fieldMetadataToRemoveId,
  id: fieldMetadataToRemoveId,
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'whateverId',
    onDelete: RelationOnDeleteAction.CASCADE,
  },
  relationTargetObjectMetadataId: PET_FLAT_OBJECT_MOCK.id,
  relationTargetFieldMetadataId: 'does-not-matter',
});

describe('deleteFieldFromFlatObjectMetadataMaps', () => {
  const testCases: EachTestingContext<DeleteFieldFromFlatObjectMetadataMapsTestCase>[] =
    [
      {
        title: 'should return same maps when object metadata id does not exist',
        context: {
          input: {
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            fieldMetadataId: 'field-1',
            objectMetadataId: 'non-existent',
          },
          expected: FLAT_OBJECT_METADATA_MAPS_MOCKS,
        },
      },
      {
        title:
          'should return same maps when field metadata id does not exist in object',
        context: {
          input: {
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            fieldMetadataId: 'non-existent-field',
            objectMetadataId: PET_FLAT_OBJECT_MOCK.id,
          },
          expected: FLAT_OBJECT_METADATA_MAPS_MOCKS,
        },
      },
      {
        title: 'should delete species custom relation from pet object',
        context: {
          input: {
            flatObjectMetadataMaps:
              dispatchAndAddFlatFieldMetadataInFlatObjectMetadataMaps({
                flatFieldMetadata: newCustomRelationFlatFieldMetadata,
                flatObjectMetadataMaps:
                  FLAT_OBJECT_METADATA_MAPS_MOCKS_WITH_ROCKET_AND_PET,
              }),
            fieldMetadataId: fieldMetadataToRemoveId,
            objectMetadataId: PET_FLAT_OBJECT_MOCK.id,
          },
          expected: FLAT_OBJECT_METADATA_MAPS_MOCKS_WITH_ROCKET_AND_PET,
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
      jestExpectToBeDefined(flatObjectMetadataMaps);
      const result = deleteFieldFromFlatObjectMetadataMaps({
        fieldMetadataId,
        flatObjectMetadataMaps,
        objectMetadataId,
      });

      expect(result).toEqual(expected);
    },
  );
});
