import {
  EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { expectFlatFieldMetadataToBeInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/__tests__/utils/expect-flat-field-metadata-to-be-in-flat-object-metadata-maps.util';
import { jestExpectToBeDefined } from 'src/engine/metadata-modules/flat-object-metadata-maps/__tests__/utils/expect-to-be-defined.util';
import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata-maps/mocks/flat-object-metadata-maps.mock';
import {
  DispatchAndAddFlatFieldMetadataInFlatObjectMetadataMapsArgs,
  dispatchAndAddFlatFieldMetadataInFlatObjectMetadataMaps,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/dispatch-and-add-flat-field-metadata-in-flat-object-metadata-maps.util';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';
import { ROCKET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/rocket-flat-object.mock';
import { fromFlatObjectMetadatasToFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadatas-to-flat-object-metadata-maps.util';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { isDefined } from 'twenty-shared/utils';

type DispatchAndAddFlatFieldMetadataInFlatObjectMetadataMapsTestCase = {
  input: DispatchAndAddFlatFieldMetadataInFlatObjectMetadataMapsArgs;
  expected:
    | ((
        arg: ReturnType<
          typeof dispatchAndAddFlatFieldMetadataInFlatObjectMetadataMaps
        >,
      ) => void)
    | undefined;
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
}) as FlatFieldMetadata<FieldMetadataType.RELATION>;

describe('dispatchAndAddFlatFieldMetadataInFlatObjectMetadataMaps', () => {
  const testCases: EachTestingContext<DispatchAndAddFlatFieldMetadataInFlatObjectMetadataMapsTestCase>[] =
    [
      {
        title: 'should return undefined when object metadata id does not exist',
        context: {
          input: {
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            flatFieldMetadata: getFlatFieldMetadataMock({
              objectMetadataId: 'non-existent',
              type: FieldMetadataType.TEXT,
              uniqueIdentifier: 'unique-id-1',
              id: 'unique-id-1',
            }),
          },
          expected: undefined,
        },
      },
      {
        only: true,
        title: 'should add a new relation field to pet object',
        context: {
          input: {
            flatObjectMetadataMaps:
              FLAT_OBJECT_METADATA_MAPS_MOCKS_WITH_ROCKET_AND_PET,
            flatFieldMetadata: newCustomRelationFlatFieldMetadata,
          },
          expected: (flatObjectMetadataMaps) => {
            jestExpectToBeDefined(flatObjectMetadataMaps);
            expectFlatFieldMetadataToBeInFlatObjectMetadataMaps({
              flatFieldMetadata: newCustomRelationFlatFieldMetadata,
              flatObjectMetadataMaps,
            });
          },
        },
      },
    ];

  const filteredTestCases = eachTestingContextFilter(testCases);

  it.each(filteredTestCases)('$title', ({ context: { input, expected } }) => {
    const result =
      dispatchAndAddFlatFieldMetadataInFlatObjectMetadataMaps(input);

    if (isDefined(expected)) {
      expected(result);
    } else {
      expect(result).toEqual(expected);
    }
  });
});
