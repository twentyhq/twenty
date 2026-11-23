/* @license Enterprise */

import {
  FieldMetadataType,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { RowLevelPermissionPredicateException } from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate.exception';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';
import { type FlatRowLevelPermissionRule } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-rule.type';
import {
  type FlattenedRowLevelPermissionPredicateGroupInput,
  type FlattenedRowLevelPermissionPredicateInput,
  type FlattenedRowLevelPermissionRuleInput,
} from 'src/engine/metadata-modules/row-level-permission-predicate/types/flattened-row-level-permission-rule-inputs.type';
import { validateRowLevelPermissionRuleOwnershipOrThrow } from 'src/engine/metadata-modules/row-level-permission-predicate/utils/validate-row-level-permission-rule-ownership.util';

const roleId = 'role-id';
const objectMetadataId = 'object-metadata-id';
const workspaceMemberObjectMetadataId = 'workspace-member-object-id';
const ownerFieldMetadataId = 'owner-field-metadata-id';
const workspaceMemberIdFieldMetadataId =
  'workspace-member-id-field-metadata-id';
const ruleId = 'rule-id';

const createFlatEntityMapsKeyedById = <TEntity extends SyncableFlatEntity>(
  entities: TEntity[],
): FlatEntityMaps<TEntity> => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.id, entity]),
  ),
  universalIdentifierById: Object.fromEntries(
    entities.map((entity) => [entity.id, entity.id]),
  ),
  universalIdentifiersByApplicationId: {},
});

const buildFlatEntityBase = (id: string) => ({
  id,
  universalIdentifier: id,
  workspaceId: 'workspace-id',
  applicationId: 'application-id',
  applicationUniversalIdentifier: 'application-universal-identifier',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

const buildFlatRule = (
  rule: Pick<FlatRowLevelPermissionRule, 'id' | 'roleId' | 'objectMetadataId'>,
): FlatRowLevelPermissionRule => ({
  ...buildFlatEntityBase(rule.id),
  canReadRecords: true,
  canCreateRecords: true,
  canUpdateRecords: true,
  canSoftDeleteRecords: true,
  canDestroyRecords: true,
  objectMetadataUniversalIdentifier: rule.objectMetadataId,
  roleUniversalIdentifier: rule.roleId,
  ...rule,
});

const buildFlatPredicate = (
  predicate: Pick<
    FlatRowLevelPermissionPredicate,
    'id' | 'roleId' | 'objectMetadataId'
  > &
    Partial<Pick<FlatRowLevelPermissionPredicate, 'deletedAt'>>,
): FlatRowLevelPermissionPredicate => ({
  ...buildFlatEntityBase(predicate.id),
  deletedAt: null,
  fieldMetadataId: ownerFieldMetadataId,
  fieldMetadataUniversalIdentifier: ownerFieldMetadataId,
  relationFieldMetadataId: null,
  relationFieldMetadataUniversalIdentifier: null,
  objectMetadataUniversalIdentifier: predicate.objectMetadataId,
  operand: RowLevelPermissionPredicateOperand.IS,
  value: null,
  subFieldName: null,
  workspaceMemberFieldMetadataId: null,
  workspaceMemberFieldMetadataUniversalIdentifier: null,
  workspaceMemberSubFieldName: null,
  workspaceMemberRelationFieldMetadataId: null,
  workspaceMemberRelationFieldMetadataUniversalIdentifier: null,
  rowLevelPermissionPredicateGroupId: null,
  rowLevelPermissionPredicateGroupUniversalIdentifier: null,
  rowLevelPermissionRuleId: null,
  rowLevelPermissionRuleUniversalIdentifier: null,
  positionInRowLevelPermissionPredicateGroup: null,
  roleUniversalIdentifier: predicate.roleId,
  ...predicate,
});

const buildFlatPredicateGroup = (
  group: Pick<
    FlatRowLevelPermissionPredicateGroup,
    'id' | 'roleId' | 'objectMetadataId'
  > &
    Partial<Pick<FlatRowLevelPermissionPredicateGroup, 'deletedAt'>>,
): FlatRowLevelPermissionPredicateGroup => ({
  ...buildFlatEntityBase(group.id),
  deletedAt: null,
  parentRowLevelPermissionPredicateGroupId: null,
  parentRowLevelPermissionPredicateGroupUniversalIdentifier: null,
  rowLevelPermissionRuleId: null,
  rowLevelPermissionRuleUniversalIdentifier: null,
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
  positionInRowLevelPermissionPredicateGroup: null,
  canReadRecords: true,
  canCreateRecords: true,
  canUpdateRecords: true,
  canSoftDeleteRecords: true,
  canDestroyRecords: true,
  objectMetadataUniversalIdentifier: group.objectMetadataId,
  roleUniversalIdentifier: group.roleId,
  childRowLevelPermissionPredicateGroupIds: [],
  childRowLevelPermissionPredicateGroupUniversalIdentifiers: [],
  rowLevelPermissionPredicateIds: [],
  rowLevelPermissionPredicateUniversalIdentifiers: [],
  ...group,
});

const defaultFields = [
  { id: ownerFieldMetadataId, name: 'owner', objectMetadataId },
  {
    id: workspaceMemberIdFieldMetadataId,
    name: 'id',
    objectMetadataId: workspaceMemberObjectMetadataId,
  },
];

const ownerMatchesCurrentUserPredicate = {
  fieldMetadataId: ownerFieldMetadataId,
  operand: RowLevelPermissionPredicateOperand.IS,
  workspaceMemberFieldMetadataId: workspaceMemberIdFieldMetadataId,
};

type ExistingEntity = {
  id: string;
  roleId: string;
  objectMetadataId: string;
  deletedAt?: string | null;
};

const validate = ({
  rules = [{ id: ruleId }],
  predicates = [],
  predicateGroups = [],
  existingRules = [],
  existingPredicates = [],
  existingGroups = [],
  fields = defaultFields,
}: {
  rules?: Partial<FlattenedRowLevelPermissionRuleInput>[];
  predicates?: (Partial<FlattenedRowLevelPermissionPredicateInput> &
    Pick<FlattenedRowLevelPermissionPredicateInput, 'fieldMetadataId'>)[];
  predicateGroups?: Partial<FlattenedRowLevelPermissionPredicateGroupInput>[];
  existingRules?: Omit<ExistingEntity, 'deletedAt'>[];
  existingPredicates?: ExistingEntity[];
  existingGroups?: ExistingEntity[];
  fields?: { id: string; name: string; objectMetadataId: string }[];
}) =>
  validateRowLevelPermissionRuleOwnershipOrThrow({
    roleId,
    objectMetadataId,
    rules: rules.map((rule) => ({
      id: ruleId,
      canReadRecords: true,
      canCreateRecords: false,
      canUpdateRecords: false,
      canSoftDeleteRecords: false,
      canDestroyRecords: false,
      ...rule,
    })),
    predicates: predicates.map((predicate) => ({
      id: 'new-predicate-id',
      rowLevelPermissionRuleId: ruleId,
      rowLevelPermissionPredicateGroupId: null,
      operand: RowLevelPermissionPredicateOperand.IS,
      positionInRowLevelPermissionPredicateGroup: null,
      ...predicate,
    })),
    predicateGroups: predicateGroups.map((predicateGroup) => ({
      id: 'new-group-id',
      rowLevelPermissionRuleId: ruleId,
      parentRowLevelPermissionPredicateGroupId: null,
      logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
      positionInRowLevelPermissionPredicateGroup: null,
      ...predicateGroup,
    })),
    flatRowLevelPermissionRuleMaps: createFlatEntityMapsKeyedById(
      existingRules.map(buildFlatRule),
    ),
    flatRowLevelPermissionPredicateMaps: createFlatEntityMapsKeyedById(
      existingPredicates.map(buildFlatPredicate),
    ),
    flatRowLevelPermissionPredicateGroupMaps: createFlatEntityMapsKeyedById(
      existingGroups.map(buildFlatPredicateGroup),
    ),
    flatFieldMetadataMaps: createFlatEntityMapsKeyedById(
      fields.map((field) =>
        getFlatFieldMetadataMock({
          universalIdentifier: field.id,
          type: FieldMetadataType.TEXT,
          ...field,
        }),
      ),
    ),
    workspaceMemberObjectMetadataId,
  });

describe('validateRowLevelPermissionRuleOwnershipOrThrow', () => {
  it('rejects a rule id owned by another role', () => {
    expect(() =>
      validate({
        rules: [{ id: 'foreign-rule-id' }],
        existingRules: [
          {
            id: 'foreign-rule-id',
            roleId: 'another-role-id',
            objectMetadataId,
          },
        ],
      }),
    ).toThrow(RowLevelPermissionPredicateException);
  });

  it('rejects a predicate id owned by another role', () => {
    expect(() =>
      validate({
        predicates: [
          { ...ownerMatchesCurrentUserPredicate, id: 'foreign-predicate-id' },
        ],
        existingPredicates: [
          {
            id: 'foreign-predicate-id',
            roleId: 'another-role-id',
            objectMetadataId,
          },
        ],
      }),
    ).toThrow(RowLevelPermissionPredicateException);
  });

  it('rejects a predicate group id owned by another object', () => {
    expect(() =>
      validate({
        predicateGroups: [{ id: 'foreign-group-id' }],
        existingGroups: [
          {
            id: 'foreign-group-id',
            roleId,
            objectMetadataId: 'another-object-metadata-id',
          },
        ],
      }),
    ).toThrow(RowLevelPermissionPredicateException);
  });

  it('rejects a field belonging to another object', () => {
    expect(() =>
      validate({
        predicates: [
          {
            fieldMetadataId: 'other-object-field-id',
            operand: RowLevelPermissionPredicateOperand.IS,
          },
        ],
        fields: [
          ...defaultFields,
          {
            id: 'other-object-field-id',
            name: 'unrelatedField',
            objectMetadataId: 'another-object-metadata-id',
          },
        ],
      }),
    ).toThrow(RowLevelPermissionPredicateException);
  });

  it('rejects a workspaceMemberFieldMetadataId that is not a workspaceMember field', () => {
    expect(() =>
      validate({
        predicates: [
          {
            fieldMetadataId: ownerFieldMetadataId,
            operand: RowLevelPermissionPredicateOperand.IS,
            workspaceMemberFieldMetadataId: ownerFieldMetadataId,
          },
        ],
      }),
    ).toThrow(RowLevelPermissionPredicateException);
  });

  it('allows reusing an existing predicate id owned by the same role and object', () => {
    expect(() =>
      validate({
        predicates: [
          { ...ownerMatchesCurrentUserPredicate, id: 'own-predicate-id' },
        ],
        existingPredicates: [
          { id: 'own-predicate-id', roleId, objectMetadataId },
        ],
      }),
    ).not.toThrow();
  });
});
