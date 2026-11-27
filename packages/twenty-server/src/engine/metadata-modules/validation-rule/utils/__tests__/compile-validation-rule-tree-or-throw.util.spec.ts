/* @license Enterprise */

import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { compileValidationRuleTreeOrThrow } from 'src/engine/metadata-modules/validation-rule/utils/compile-validation-rule-tree-or-throw.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const OBJECT_METADATA_ID = 'object-metadata-id';

const compile = ({
  expression,
  isActive,
}: {
  expression: string;
  isActive: boolean;
}) => {
  const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> =
    createEmptyFlatEntityMaps();
  const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> =
    createEmptyFlatEntityMaps();

  addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
    flatEntity: getFlatObjectMetadataMock({
      id: OBJECT_METADATA_ID,
      universalIdentifier: 'object-universal-identifier',
      fieldIds: ['employees-id'],
    }),
    flatEntityMapsToMutate: flatObjectMetadataMaps,
  });
  addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
    flatEntity: getFlatFieldMetadataMock({
      id: 'employees-id',
      universalIdentifier: 'employees-universal-identifier',
      name: 'employees',
      objectMetadataId: OBJECT_METADATA_ID,
      type: FieldMetadataType.NUMBER,
    }),
    flatEntityMapsToMutate: flatFieldMetadataMaps,
  });

  return compileValidationRuleTreeOrThrow({
    expression,
    isActive,
    objectMetadataId: OBJECT_METADATA_ID,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });
};

describe('compileValidationRuleTreeOrThrow', () => {
  it('should read fields by universal identifier', () => {
    expect(compile({ expression: 'employees > 10', isActive: true })).toEqual({
      type: 'COMPARISON',
      operator: 'GREATER_THAN',
      left: {
        type: 'FIELD',
        fieldUniversalIdentifier: 'employees-universal-identifier',
      },
      right: { type: 'LITERAL', value: 10 },
    });
  });

  it('should reject an active rule that does not compile', () => {
    expect(() =>
      compile({ expression: 'headcount > 10', isActive: true }),
    ).toThrow('Unknown field "headcount"');
  });

  it('should keep an unknown field of an inactive rule by name', () => {
    expect(
      compile({ expression: 'headcount > 10', isActive: false }),
    ).toMatchObject({ left: { type: 'VARIABLE', path: 'headcount' } });
  });

  it('should reject an inactive rule that does not parse', () => {
    expect(() =>
      compile({ expression: 'employees >', isActive: false }),
    ).toThrow();
  });
});
