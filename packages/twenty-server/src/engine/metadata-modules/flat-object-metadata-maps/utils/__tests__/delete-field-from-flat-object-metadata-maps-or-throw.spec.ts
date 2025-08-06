import { jestExpectToBeDefined } from 'test/utils/expect-to-be-defined.util.test';
import {
  EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata-maps/mocks/flat-object-metadata-maps.mock';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { deleteFieldFromFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-field-from-flat-object-metadata-maps-or-throw.util';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';

type DeleteFieldFromFlatObjectMetadataMapsTestCase = {
  input: {
    flatObjectMetadataMaps: FlatObjectMetadataMaps | undefined;
    fieldMetadataId: string;
    objectMetadataId: string;
  };
  shouldThrow?: true;
  expected?: FlatObjectMetadataMaps;
};

describe('deleteFieldFromFlatObjectMetadataMapsOrThrow', () => {
  const testCases: EachTestingContext<DeleteFieldFromFlatObjectMetadataMapsTestCase>[] =
    [
      {
        title: 'should throw when object metadata id does not exist',
        context: {
          input: {
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            fieldMetadataId: 'field-1',
            objectMetadataId: 'non-existent',
          },
          shouldThrow: true,
        },
      },
      {
        title: 'should throw when field metadata id does not exist in object',
        context: {
          input: {
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            fieldMetadataId: 'non-existent-field',
            objectMetadataId: PET_FLAT_OBJECT_MOCK.id,
          },
          shouldThrow: true,
        },
      },
      {
        title: 'should delete species custom relation from pet object',
        context: {
          input: {
            flatObjectMetadataMaps:
              addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
                flatFieldMetadata: getFlatFieldMetadataMock({
                  objectMetadataId: PET_FLAT_OBJECT_MOCK.id,
                  type: FieldMetadataType.RELATION,
                  uniqueIdentifier: 'field-metadata-id',
                  id: 'field-metadata-id',
                  settings: {
                    relationType: RelationType.MANY_TO_ONE,
                    joinColumnName: 'whateverId',
                    onDelete: RelationOnDeleteAction.CASCADE,
                  },
                  relationTargetObjectMetadataId: PET_FLAT_OBJECT_MOCK.id,
                  relationTargetFieldMetadataId: 'does-not-matter',
                }),
                flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
              }),
            fieldMetadataId: 'field-metadata-id',
            objectMetadataId: PET_FLAT_OBJECT_MOCK.id,
          },
          expected: FLAT_OBJECT_METADATA_MAPS_MOCKS,
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
        shouldThrow = false,
      },
    }) => {
      jestExpectToBeDefined(flatObjectMetadataMaps);
      if (shouldThrow) {
        expect(() =>
          deleteFieldFromFlatObjectMetadataMapsOrThrow({
            fieldMetadataId,
            flatObjectMetadataMaps,
            objectMetadataId,
          }),
        ).toThrowErrorMatchingSnapshot();
      } else {
        const result = deleteFieldFromFlatObjectMetadataMapsOrThrow({
          fieldMetadataId,
          flatObjectMetadataMaps,
          objectMetadataId,
        });

        expect(result).toEqual(expected);
      }
    },
  );
});
