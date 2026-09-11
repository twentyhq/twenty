import {
  FieldMetadataType,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { FlatRowLevelPermissionPredicateValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-row-level-permission-predicate-validator.service';

const PREDICATE_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000a1';
const FIELD_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000b1';
const OBJECT_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000c1';
const ROLE_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000d1';
const WORKSPACE_MEMBER_ID_FIELD_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-0000000000b2';
const WORKSPACE_MEMBER_RELATION_FIELD_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-0000000000b3';
const WORKSPACE_MEMBER_OTHER_RELATION_FIELD_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-0000000000b4';
const ONE_TO_MANY_FIELD_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-0000000000b5';
const WORKSPACE_MEMBER_MORPH_FIELD_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-0000000000b6';
const RELATION_TARGET_OBJECT_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-0000000000c2';
const OTHER_RELATION_TARGET_OBJECT_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-0000000000c3';
const SHARING_RULE_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-0000000000e1';
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
  fieldMetadataUniversalIdentifier = FIELD_UNIVERSAL_IDENTIFIER,
}: {
  operand: RowLevelPermissionPredicateOperand;
  value: unknown;
  workspaceMemberFieldMetadataUniversalIdentifier?: string | null;
  fieldMetadataUniversalIdentifier?: string;
}) => ({
  universalIdentifier: PREDICATE_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier,
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
      name: 'accountOwner',
      label: 'Account Owner',
      universalSettings: { relationType: RelationType.MANY_TO_ONE },
      relationTargetObjectMetadataUniversalIdentifier:
        RELATION_TARGET_OBJECT_UNIVERSAL_IDENTIFIER,
    },
    {
      universalIdentifier: ONE_TO_MANY_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldMetadataType.RELATION,
      name: 'people',
      label: 'People',
      universalSettings: { relationType: RelationType.ONE_TO_MANY },
      relationTargetObjectMetadataUniversalIdentifier:
        RELATION_TARGET_OBJECT_UNIVERSAL_IDENTIFIER,
    },
    {
      universalIdentifier: WORKSPACE_MEMBER_MORPH_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldMetadataType.MORPH_RELATION,
      name: 'target',
      label: 'Target',
      universalSettings: { relationType: RelationType.MANY_TO_ONE },
      relationTargetObjectMetadataUniversalIdentifier:
        RELATION_TARGET_OBJECT_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier:
        STANDARD_OBJECTS.workspaceMember.universalIdentifier,
    },
    {
      universalIdentifier: WORKSPACE_MEMBER_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldMetadataType.UUID,
      name: 'id',
      label: 'Id',
      objectMetadataUniversalIdentifier:
        STANDARD_OBJECTS.workspaceMember.universalIdentifier,
    },
    {
      universalIdentifier: WORKSPACE_MEMBER_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldMetadataType.RELATION,
      name: 'region',
      label: 'Region',
      universalSettings: { relationType: RelationType.MANY_TO_ONE },
      relationTargetObjectMetadataUniversalIdentifier:
        RELATION_TARGET_OBJECT_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier:
        STANDARD_OBJECTS.workspaceMember.universalIdentifier,
    },
    {
      universalIdentifier:
        WORKSPACE_MEMBER_OTHER_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldMetadataType.RELATION,
      name: 'team',
      label: 'Team',
      universalSettings: { relationType: RelationType.MANY_TO_ONE },
      relationTargetObjectMetadataUniversalIdentifier:
        OTHER_RELATION_TARGET_OBJECT_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier:
        STANDARD_OBJECTS.workspaceMember.universalIdentifier,
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
  fieldMetadataUniversalIdentifier,
}: {
  fieldType: FieldMetadataType;
  operand: RowLevelPermissionPredicateOperand;
  value: unknown;
  workspaceMemberFieldMetadataUniversalIdentifier?: string | null;
  fieldMetadataUniversalIdentifier?: string;
}) =>
  ({
    flatEntityToValidate: buildPredicate({
      operand,
      value,
      workspaceMemberFieldMetadataUniversalIdentifier,
      fieldMetadataUniversalIdentifier,
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

    it.each([[''], ['[]'], [[]]])(
      'should reject %p on an operand that expects a value',
      (value) => {
        const result = service.validateFlatRowLevelPermissionPredicateCreation(
          buildCreationArgs({
            fieldType: FieldMetadataType.RELATION,
            operand: RowLevelPermissionPredicateOperand.IS,
            value,
          }),
        );

        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toContain('requires a value');
      },
    );

    it.each([[null], [undefined]])(
      'should accept %p, a predicate whose value is not filled in yet',
      (value) => {
        const result = service.validateFlatRowLevelPermissionPredicateCreation(
          buildCreationArgs({
            fieldType: FieldMetadataType.TEXT,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            value,
          }),
        );

        expect(result.errors).toEqual([]);
      },
    );

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
            WORKSPACE_MEMBER_ID_FIELD_UNIVERSAL_IDENTIFIER,
        }),
      );

      expect(result.errors).toEqual([]);
    });

    it('should accept two relations pointing to the same object', () => {
      const result = service.validateFlatRowLevelPermissionPredicateCreation(
        buildCreationArgs({
          fieldType: FieldMetadataType.RELATION,
          operand: RowLevelPermissionPredicateOperand.IS,
          value: null,
          workspaceMemberFieldMetadataUniversalIdentifier:
            WORKSPACE_MEMBER_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
        }),
      );

      expect(result.errors).toEqual([]);
    });

    it('should reject two relations pointing to different objects', () => {
      const result = service.validateFlatRowLevelPermissionPredicateCreation(
        buildCreationArgs({
          fieldType: FieldMetadataType.RELATION,
          operand: RowLevelPermissionPredicateOperand.IS,
          value: null,
          workspaceMemberFieldMetadataUniversalIdentifier:
            WORKSPACE_MEMBER_OTHER_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
        }),
      );

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain(
        'must be relations pointing to the same object',
      );
    });

    it('should reject a member field that belongs to another object', () => {
      const result = service.validateFlatRowLevelPermissionPredicateCreation(
        buildCreationArgs({
          fieldType: FieldMetadataType.RELATION,
          operand: RowLevelPermissionPredicateOperand.IS,
          value: null,
          workspaceMemberFieldMetadataUniversalIdentifier:
            FIELD_UNIVERSAL_IDENTIFIER,
        }),
      );

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain(
        'is not a field of the workspaceMember object',
      );
    });

    it('should reject a morph relation on the workspace member', () => {
      const result = service.validateFlatRowLevelPermissionPredicateCreation(
        buildCreationArgs({
          fieldType: FieldMetadataType.RELATION,
          operand: RowLevelPermissionPredicateOperand.IS,
          value: null,
          workspaceMemberFieldMetadataUniversalIdentifier:
            WORKSPACE_MEMBER_MORPH_FIELD_UNIVERSAL_IDENTIFIER,
        }),
      );

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain(
        'is not a many-to-one relation, its value cannot be resolved',
      );
    });

    it('should reject a record field that is not a many-to-one relation', () => {
      const result = service.validateFlatRowLevelPermissionPredicateCreation(
        buildCreationArgs({
          fieldType: FieldMetadataType.RELATION,
          operand: RowLevelPermissionPredicateOperand.IS,
          value: null,
          fieldMetadataUniversalIdentifier:
            ONE_TO_MANY_FIELD_UNIVERSAL_IDENTIFIER,
          workspaceMemberFieldMetadataUniversalIdentifier:
            WORKSPACE_MEMBER_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
        }),
      );

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('has no join column');
    });

    it('should reject an operand the relation query filter cannot express', () => {
      const result = service.validateFlatRowLevelPermissionPredicateCreation(
        buildCreationArgs({
          fieldType: FieldMetadataType.RELATION,
          operand: RowLevelPermissionPredicateOperand.CONTAINS,
          value: null,
          workspaceMemberFieldMetadataUniversalIdentifier:
            WORKSPACE_MEMBER_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
        }),
      );

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('use IS or IS_NOT');
    });
  });

  describe('update', () => {
    it('should refuse moving a predicate from its role to a sharing rule', () => {
      const result = service.validateFlatRowLevelPermissionPredicateUpdate(
        buildUpdateArgs({
          fieldType: FieldMetadataType.TEXT,
          operand: RowLevelPermissionPredicateOperand.CONTAINS,
          value: 'visible',
          flatEntityUpdate: {
            roleUniversalIdentifier: null,
            sharingRuleUniversalIdentifier: SHARING_RULE_UNIVERSAL_IDENTIFIER,
          },
        }),
      );

      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message:
              'Cannot modify predicate to change the role or sharing rule it belongs to',
          }),
        ]),
      );
    });

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
