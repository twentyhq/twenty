import {
  FieldMetadataType,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type RowLevelPermissionPredicateInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-predicates.input';
import { validateRowLevelPermissionPredicateOperandsOrThrow } from 'src/engine/metadata-modules/row-level-permission-predicate/utils/validate-row-level-permission-predicate-operands.util';

const TEXT_FIELD_ID = 'text-field';
const SELECT_FIELD_ID = 'select-field';

const flatFieldMetadataMaps = [
  {
    id: TEXT_FIELD_ID,
    universalIdentifier: TEXT_FIELD_ID,
    name: 'name',
    type: FieldMetadataType.TEXT,
  },
  {
    id: SELECT_FIELD_ID,
    universalIdentifier: SELECT_FIELD_ID,
    name: 'status',
    type: FieldMetadataType.SELECT,
  },
].reduce(
  (maps, entity) =>
    addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: entity as never,
      flatEntityMaps: maps,
    }),
  createEmptyFlatEntityMaps(),
) as unknown as FlatEntityMaps<FlatFieldMetadata>;

const buildPredicate = (
  predicate: Partial<RowLevelPermissionPredicateInput>,
): RowLevelPermissionPredicateInput =>
  ({
    fieldMetadataId: TEXT_FIELD_ID,
    operand: RowLevelPermissionPredicateOperand.CONTAINS,
    ...predicate,
  }) as RowLevelPermissionPredicateInput;

describe('validateRowLevelPermissionPredicateOperandsOrThrow', () => {
  it('should accept an operand valid for the field type', () => {
    expect(() =>
      validateRowLevelPermissionPredicateOperandsOrThrow({
        predicates: [
          buildPredicate({
            fieldMetadataId: TEXT_FIELD_ID,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
          }),
          buildPredicate({
            fieldMetadataId: SELECT_FIELD_ID,
            operand: RowLevelPermissionPredicateOperand.IS,
          }),
        ],
        flatFieldMetadataMaps,
      }),
    ).not.toThrow();
  });

  it('should throw for an IS operand on a text field', () => {
    expect(() =>
      validateRowLevelPermissionPredicateOperandsOrThrow({
        predicates: [
          buildPredicate({
            fieldMetadataId: TEXT_FIELD_ID,
            operand: RowLevelPermissionPredicateOperand.IS,
          }),
        ],
        flatFieldMetadataMaps,
      }),
    ).toThrow(/Operand IS is not supported for field name of type TEXT/);
  });

  it('should throw for a contains operand on a select field', () => {
    expect(() =>
      validateRowLevelPermissionPredicateOperandsOrThrow({
        predicates: [
          buildPredicate({
            fieldMetadataId: SELECT_FIELD_ID,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
          }),
        ],
        flatFieldMetadataMaps,
      }),
    ).toThrow(
      /Operand CONTAINS is not supported for field status of type SELECT/,
    );
  });

  it('should skip a predicate whose field metadata is missing', () => {
    expect(() =>
      validateRowLevelPermissionPredicateOperandsOrThrow({
        predicates: [
          buildPredicate({
            fieldMetadataId: 'unknown-field',
            operand: RowLevelPermissionPredicateOperand.IS,
          }),
        ],
        flatFieldMetadataMaps,
      }),
    ).not.toThrow();
  });
});
