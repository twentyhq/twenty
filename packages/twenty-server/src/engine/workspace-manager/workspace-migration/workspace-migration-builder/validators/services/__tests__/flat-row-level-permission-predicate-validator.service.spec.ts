import {
  FieldMetadataType,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { FlatRowLevelPermissionPredicateValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-row-level-permission-predicate-validator.service';

const PREDICATE_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000a1';
const FIELD_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000b1';
const OBJECT_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000c1';
const ROLE_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000d1';
const RECORD_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const mapsFrom = (
  entities: { universalIdentifier: string; [key: string]: unknown }[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity]),
  ),
});

const buildPredicate = ({
  operand,
  value,
  workspaceMemberFieldMetadataUniversalIdentifier = null,
}: {
  operand: RowLevelPermissionPredicateOperand;
  value: unknown;
  workspaceMemberFieldMetadataUniversalIdentifier?: string | null;
}) => ({
  universalIdentifier: PREDICATE_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  roleUniversalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
  rowLevelPermissionPredicateGroupUniversalIdentifier: null,
  operand,
  value,
  subFieldName: null,
  workspaceMemberFieldMetadataUniversalIdentifier,
});

const relatedMaps = (fieldType: FieldMetadataType) => ({
  flatRowLevelPermissionPredicateGroupMaps: mapsFrom([]),
  flatFieldMetadataMaps: mapsFrom([
    {
      universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      type: fieldType,
      label: 'Account Owner',
    },
  ]),
  flatObjectMetadataMaps: mapsFrom([
    { universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER },
  ]),
  flatRoleMaps: mapsFrom([{ universalIdentifier: ROLE_UNIVERSAL_IDENTIFIER }]),
});

const buildCreationArgs = ({
  fieldType,
  operand,
  value,
  workspaceMemberFieldMetadataUniversalIdentifier = null,
}: {
  fieldType: FieldMetadataType;
  operand: RowLevelPermissionPredicateOperand;
  value: unknown;
  workspaceMemberFieldMetadataUniversalIdentifier?: string | null;
}) =>
  ({
    flatEntityToValidate: buildPredicate({
      operand,
      value,
      workspaceMemberFieldMetadataUniversalIdentifier,
    }),
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRowLevelPermissionPredicateMaps: mapsFrom([]),
      ...relatedMaps(fieldType),
    },
  }) as unknown as Parameters<
    FlatRowLevelPermissionPredicateValidatorService['validateFlatRowLevelPermissionPredicateCreation']
  >[0];

const buildUpdateArgs = ({
  fieldType,
  operand,
  value,
  flatEntityUpdate,
  workspaceMemberFieldMetadataUniversalIdentifier = null,
}: {
  fieldType: FieldMetadataType;
  operand: RowLevelPermissionPredicateOperand;
  value: unknown;
  flatEntityUpdate: Record<string, unknown>;
  workspaceMemberFieldMetadataUniversalIdentifier?: string | null;
}) =>
  ({
    universalIdentifier: PREDICATE_UNIVERSAL_IDENTIFIER,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRowLevelPermissionPredicateMaps: mapsFrom([
        buildPredicate({
          operand,
          value,
          workspaceMemberFieldMetadataUniversalIdentifier,
        }),
      ]),
      ...relatedMaps(fieldType),
    },
  }) as unknown as Parameters<
    FlatRowLevelPermissionPredicateValidatorService['validateFlatRowLevelPermissionPredicateUpdate']
  >[0];

describe('FlatRowLevelPermissionPredicateValidatorService', () => {
  let service: FlatRowLevelPermissionPredicateValidatorService;

  beforeEach(() => {
    service = new FlatRowLevelPermissionPredicateValidatorService();
  });

  describe('creation', () => {
    it('should reject a relation value that resolves to no record id', () => {
      const result = service.validateFlatRowLevelPermissionPredicateCreation(
        buildCreationArgs({
          fieldType: FieldMetadataType.RELATION,
          operand: RowLevelPermissionPredicateOperand.IS,
          value: { direction: 'NEXT', amount: 30, unit: 'DAY' },
        }),
      );

      expect(result.errors).toHaveLength(1);
    });

    it('should reject the object form of a relative date predicate', () => {
      const result = service.validateFlatRowLevelPermissionPredicateCreation(
        buildCreationArgs({
          fieldType: FieldMetadataType.DATE,
          operand: RowLevelPermissionPredicateOperand.IS_RELATIVE,
          value: { direction: 'NEXT', amount: 30, unit: 'DAY' },
        }),
      );

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('NEXT_30_DAY');
    });

    it('should accept a valid predicate value', () => {
      const result = service.validateFlatRowLevelPermissionPredicateCreation(
        buildCreationArgs({
          fieldType: FieldMetadataType.RELATION,
          operand: RowLevelPermissionPredicateOperand.IS,
          value: { selectedRecordIds: [RECORD_ID] },
        }),
      );

      expect(result.errors).toEqual([]);
    });

    it('should reject an empty value on an operand that expects one', () => {
      const result = service.validateFlatRowLevelPermissionPredicateCreation(
        buildCreationArgs({
          fieldType: FieldMetadataType.RELATION,
          operand: RowLevelPermissionPredicateOperand.IS,
          value: '',
        }),
      );

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('requires a value');
    });

    it('should accept a value-less operand with no value', () => {
      const result = service.validateFlatRowLevelPermissionPredicateCreation(
        buildCreationArgs({
          fieldType: FieldMetadataType.RELATION,
          operand: RowLevelPermissionPredicateOperand.IS_NOT_EMPTY,
          value: null,
        }),
      );

      expect(result.errors).toEqual([]);
    });

    it('should skip validation when the value is resolved from the workspace member', () => {
      const result = service.validateFlatRowLevelPermissionPredicateCreation(
        buildCreationArgs({
          fieldType: FieldMetadataType.RELATION,
          operand: RowLevelPermissionPredicateOperand.IS,
          value: null,
          workspaceMemberFieldMetadataUniversalIdentifier:
            FIELD_UNIVERSAL_IDENTIFIER,
        }),
      );

      expect(result.errors).toEqual([]);
    });
  });

  describe('update', () => {
    it('should validate the retained value when workspace member resolution is cleared', () => {
      const result = service.validateFlatRowLevelPermissionPredicateUpdate(
        buildUpdateArgs({
          fieldType: FieldMetadataType.RELATION,
          operand: RowLevelPermissionPredicateOperand.IS,
          value: { direction: 'NEXT', amount: 30, unit: 'DAY' },
          workspaceMemberFieldMetadataUniversalIdentifier:
            FIELD_UNIVERSAL_IDENTIFIER,
          flatEntityUpdate: {
            workspaceMemberFieldMetadataUniversalIdentifier: null,
          },
        }),
      );

      expect(result.errors).toHaveLength(1);
    });

    it('should not validate the value when it is not part of the update', () => {
      const result = service.validateFlatRowLevelPermissionPredicateUpdate(
        buildUpdateArgs({
          fieldType: FieldMetadataType.RELATION,
          operand: RowLevelPermissionPredicateOperand.IS,
          value: { direction: 'NEXT', amount: 30, unit: 'DAY' },
          flatEntityUpdate: { positionInRowLevelPermissionPredicateGroup: 2 },
        }),
      );

      expect(result.errors).toEqual([]);
    });
  });
});
