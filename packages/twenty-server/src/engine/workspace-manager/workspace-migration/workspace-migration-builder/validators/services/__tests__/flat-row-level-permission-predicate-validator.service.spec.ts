import {
  FieldMetadataType,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { FlatRowLevelPermissionPredicateValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-row-level-permission-predicate-validator.service';

const PREDICATE_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000a1';
const FIELD_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000b1';
const OBJECT_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000c1';
const ROLE_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000d1';

const mapsFrom = (
  entities: { universalIdentifier: string; [key: string]: unknown }[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity]),
  ),
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
    flatEntityToValidate: {
      universalIdentifier: PREDICATE_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      roleUniversalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
      rowLevelPermissionPredicateGroupUniversalIdentifier: null,
      operand,
      value,
      subFieldName: null,
      workspaceMemberFieldMetadataUniversalIdentifier,
    },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRowLevelPermissionPredicateMaps: mapsFrom([]),
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
      flatRoleMaps: mapsFrom([
        { universalIdentifier: ROLE_UNIVERSAL_IDENTIFIER },
      ]),
    },
  }) as unknown as Parameters<
    FlatRowLevelPermissionPredicateValidatorService['validateFlatRowLevelPermissionPredicateCreation']
  >[0];

describe('FlatRowLevelPermissionPredicateValidatorService', () => {
  let service: FlatRowLevelPermissionPredicateValidatorService;

  beforeEach(() => {
    service = new FlatRowLevelPermissionPredicateValidatorService();
  });

  it('should reject a relation predicate value that resolves to no record id', () => {
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
        value: { selectedRecordIds: [ROLE_UNIVERSAL_IDENTIFIER] },
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
        workspaceMemberFieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      }),
    );

    expect(result.errors).toEqual([]);
  });
});
