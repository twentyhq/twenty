import {
  EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { PET_FLAT_FIELDS_MOCK } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/pet-flat-fields.mock';
import { expectFlatFieldMetadataToBeInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/__tests__/utils/expect-flat-field-metadata-to-be-in-flat-object-metadata-maps.util.test';
import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata-maps/mocks/flat-object-metadata-maps.mock';
import {
  AddFlatFieldMetadataInFlatObjectMetadataMapsOrThrowArgs,
  addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';

type AddFlatFieldMetadataInFlatObjectMetadataMapsOrThrowArgsTestCase = {
  input: AddFlatFieldMetadataInFlatObjectMetadataMapsOrThrowArgs;
  shouldThrow?: true;
};

describe('addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow', () => {
  const testCases: EachTestingContext<AddFlatFieldMetadataInFlatObjectMetadataMapsOrThrowArgsTestCase>[] =
    [
      {
        title:
          'should throw when field metadata parent object metadata does not exist',
        context: {
          shouldThrow: true,
          input: {
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            flatFieldMetadata: getFlatFieldMetadataMock({
              objectMetadataId: 'non-existent',
              type: FieldMetadataType.TEXT,
              uniqueIdentifier: 'unique-id-1',
              id: 'unique-id-1',
            }),
          },
        },
      },
      {
        title:
          'should throw when field metadata to add already exist in object',
        context: {
          shouldThrow: true,
          input: {
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
            flatFieldMetadata: PET_FLAT_FIELDS_MOCK.species,
          },
        },
      },
      {
        title: 'should add a new relation field to pet object',
        context: {
          input: {
            flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
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
          addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
            flatFieldMetadata,
            flatObjectMetadataMaps,
          }),
        ).toThrowErrorMatchingSnapshot();
      } else {
        const updatedFlatObjectMetadataMaps =
          addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
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
