/* @license Enterprise */

import {
  FieldMetadataType,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import {
  type RowLevelPermissionPredicateGroupInput,
  type RowLevelPermissionPredicateInput,
} from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-predicates.input';
import { RowLevelPermissionPredicateException } from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate.exception';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';
import { validateRowLevelPermissionRuleOwnershipOrThrow } from 'src/engine/metadata-modules/row-level-permission-predicate/utils/validate-row-level-permission-rule-ownership.util';

const roleId = 'role-id';
const objectMetadataId = 'object-metadata-id';
const workspaceMemberObjectMetadataId = 'workspace-member-object-id';
const ownerFieldMetadataId = 'owner-field-metadata-id';
const workspaceMemberIdFieldMetadataId =
  'workspace-member-id-field-metadata-id';

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
  deletedAt: null,
});

const buildFlatPredicate = (
  predicate: Pick<
    FlatRowLevelPermissionPredicate,
    'id' | 'roleId' | 'objectMetadataId'
  > &
    Partial<Pick<FlatRowLevelPermissionPredicate, 'deletedAt'>>,
): FlatRowLevelPermissionPredicate => ({
  ...buildFlatEntityBase(predicate.id),
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
  rowLevelPermissionPredicateGroupId: null,
  rowLevelPermissionPredicateGroupUniversalIdentifier: null,
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
  parentRowLevelPermissionPredicateGroupId: null,
  parentRowLevelPermissionPredicateGroupUniversalIdentifier: null,
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

const validate = ({
  predicates = [],
  predicateGroups = [],
  existingPredicates = [],
  existingGroups = [],
  fields = defaultFields,
}: {
  predicates?: object[];
  predicateGroups?: object[];
  existingPredicates?: {
    id: string;
    roleId: string;
    objectMetadataId: string;
    deletedAt?: string | null;
  }[];
  existingGroups?: {
    id: string;
    roleId: string;
    objectMetadataId: string;
    deletedAt?: string | null;
  }[];
  fields?: { id: string; name: string; objectMetadataId: string }[];
}) =>
  validateRowLevelPermissionRuleOwnershipOrThrow({
    roleId,
    objectMetadataId,
    predicates: predicates as RowLevelPermissionPredicateInput[],
    predicateGroups: predicateGroups as RowLevelPermissionPredicateGroupInput[],
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
        predicateGroups: [{ id: 'foreign-group-id', logicalOperator: 'AND' }],
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

  it('rejects a predicate referencing a group of another role', () => {
    expect(() =>
      validate({
        predicates: [
          {
            ...ownerMatchesCurrentUserPredicate,
            rowLevelPermissionPredicateGroupId: 'foreign-group-id',
          },
        ],
        existingGroups: [
          {
            id: 'foreign-group-id',
            roleId: 'another-role-id',
            objectMetadataId,
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

  it('allows a predicate referencing a group declared in the same payload', () => {
    expect(() =>
      validate({
        predicates: [
          {
            ...ownerMatchesCurrentUserPredicate,
            rowLevelPermissionPredicateGroupId: 'new-group-id',
          },
        ],
        predicateGroups: [{ id: 'new-group-id', logicalOperator: 'AND' }],
      }),
    ).not.toThrow();
  });
});
