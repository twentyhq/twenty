import {
  FeatureFlagKey,
  FieldMetadataType,
  RelationType,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
  type RowLevelRecordsPermissions,
} from 'twenty-shared/types';

import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { findAccessGroupValueLookups } from 'src/engine/permissions/internal/access-group/utils/find-access-group-value-lookups.util';

const OPPORTUNITY_ID = 'opportunity-object';
const COMPANY_ID = 'company-object';
const WORKSPACE_MEMBER_ID = 'workspace-member-object';
const ROLE_ID = 'role-1';
const RULE_ID = 'rule-1';

const buildMaps = <TFlatEntity extends SyncableFlatEntity>(
  entities: TFlatEntity[],
) =>
  entities.reduce<FlatEntityMaps<TFlatEntity>>(
    (maps, entity) =>
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: entity,
        flatEntityMaps: maps,
      }),
    createEmptyFlatEntityMaps(),
  );

const opportunity = getFlatObjectMetadataMock({
  id: OPPORTUNITY_ID,
  universalIdentifier: OPPORTUNITY_ID,
  nameSingular: 'opportunity',
  namePlural: 'opportunities',
  fieldIds: [
    'opportunity-owner',
    'opportunity-company',
    'opportunity-name',
    'opportunity-stage',
  ],
});

const flatObjectMetadataMaps = buildMaps([
  opportunity,
  getFlatObjectMetadataMock({
    id: COMPANY_ID,
    universalIdentifier: COMPANY_ID,
    nameSingular: 'company',
    namePlural: 'companies',
    fieldIds: ['company-account-owner', 'company-opportunities'],
  }),
  getFlatObjectMetadataMock({
    id: WORKSPACE_MEMBER_ID,
    universalIdentifier: WORKSPACE_MEMBER_ID,
    nameSingular: 'workspaceMember',
    namePlural: 'workspaceMembers',
    fieldIds: ['workspace-member-id', 'workspace-member-locale'],
  }),
]);

const buildManyToOneField = ({
  id,
  name,
  objectMetadataId,
  relationTargetObjectMetadataId,
  relationTargetFieldMetadataId,
}: {
  id: string;
  name: string;
  objectMetadataId: string;
  relationTargetObjectMetadataId: string;
  relationTargetFieldMetadataId: string;
}) =>
  getFlatFieldMetadataMock({
    id,
    universalIdentifier: id,
    name,
    type: FieldMetadataType.RELATION,
    objectMetadataId,
    relationTargetObjectMetadataId,
    relationTargetFieldMetadataId,
    settings: {
      relationType: RelationType.MANY_TO_ONE,
      joinColumnName: `${name}Id`,
    },
  });

const flatFieldMetadataMaps = buildMaps([
  buildManyToOneField({
    id: 'opportunity-owner',
    name: 'owner',
    objectMetadataId: OPPORTUNITY_ID,
    relationTargetObjectMetadataId: WORKSPACE_MEMBER_ID,
    relationTargetFieldMetadataId: 'workspace-member-owned-opportunities',
  }),
  buildManyToOneField({
    id: 'opportunity-company',
    name: 'company',
    objectMetadataId: OPPORTUNITY_ID,
    relationTargetObjectMetadataId: COMPANY_ID,
    relationTargetFieldMetadataId: 'company-opportunities',
  }),
  getFlatFieldMetadataMock({
    id: 'opportunity-name',
    universalIdentifier: 'opportunity-name',
    name: 'name',
    type: FieldMetadataType.TEXT,
    objectMetadataId: OPPORTUNITY_ID,
  }),
  getFlatFieldMetadataMock({
    id: 'opportunity-stage',
    universalIdentifier: 'opportunity-stage',
    name: 'stage',
    type: FieldMetadataType.SELECT,
    objectMetadataId: OPPORTUNITY_ID,
    options: [
      {
        id: 'stage-open',
        value: 'OPEN',
        label: 'Open',
        color: 'blue',
        position: 0,
      },
      {
        id: 'stage-won',
        value: 'WON',
        label: 'Won',
        color: 'green',
        position: 1,
      },
    ],
  }),
  buildManyToOneField({
    id: 'company-account-owner',
    name: 'accountOwner',
    objectMetadataId: COMPANY_ID,
    relationTargetObjectMetadataId: WORKSPACE_MEMBER_ID,
    relationTargetFieldMetadataId: 'workspace-member-owned-companies',
  }),
  getFlatFieldMetadataMock({
    id: 'company-opportunities',
    universalIdentifier: 'company-opportunities',
    name: 'opportunities',
    type: FieldMetadataType.RELATION,
    objectMetadataId: COMPANY_ID,
    relationTargetObjectMetadataId: OPPORTUNITY_ID,
    relationTargetFieldMetadataId: 'opportunity-company',
    settings: { relationType: RelationType.ONE_TO_MANY },
  }),
  getFlatFieldMetadataMock({
    id: 'workspace-member-id',
    universalIdentifier: 'workspace-member-id',
    name: 'id',
    type: FieldMetadataType.UUID,
    objectMetadataId: WORKSPACE_MEMBER_ID,
  }),
  getFlatFieldMetadataMock({
    id: 'workspace-member-locale',
    universalIdentifier: 'workspace-member-locale',
    name: 'locale',
    type: FieldMetadataType.TEXT,
    objectMetadataId: WORKSPACE_MEMBER_ID,
  }),
]);

const buildPredicate = ({
  id,
  ...predicate
}: Pick<RowLevelPermissionPredicate, 'id'> &
  Partial<RowLevelPermissionPredicate>): RowLevelPermissionPredicate => ({
  id,
  roleId: ROLE_ID,
  objectMetadataId: OPPORTUNITY_ID,
  fieldMetadataId: 'opportunity-owner',
  relationFieldMetadataId: null,
  operand: RowLevelPermissionPredicateOperand.IS,
  value: null,
  subFieldName: null,
  workspaceMemberFieldMetadataId: 'workspace-member-id',
  workspaceMemberSubFieldName: null,
  rowLevelPermissionPredicateGroupId: null,
  ...predicate,
});

const buildPredicateGroup = ({
  id,
  logicalOperator,
}: {
  id: string;
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator;
}): RowLevelPermissionPredicateGroup => ({
  id,
  objectMetadataId: OPPORTUNITY_ID,
  positionInRowLevelPermissionPredicateGroup: null,
  canReadRecords: true,
  canUpdateRecords: true,
  canSoftDeleteRecords: true,
  canDestroyRecords: true,
  roleId: ROLE_ID,
  logicalOperator,
  parentRowLevelPermissionPredicateGroupId: null,
});

const findLookups = ({
  predicates,
  predicateGroups = [],
  isRelationHopEnabled = true,
}: {
  predicates: RowLevelPermissionPredicate[];
  predicateGroups?: RowLevelPermissionPredicateGroup[];
  isRelationHopEnabled?: boolean;
}) =>
  findAccessGroupValueLookups({
    flatObjectMetadata: opportunity,
    metadataMaps: {
      featureFlagsMap: {
        [FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED]: true,
        [FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED]:
          isRelationHopEnabled,
      },
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatFieldMetadataOptionMaps: createEmptyFlatEntityMaps(),
      rolesPermissions: {
        [ROLE_ID]: {
          canReadAllRecords: false,
          canUpdateAllRecords: false,
          canSoftDeleteAllRecords: false,
          canDestroyAllRecords: false,
          objects: {
            [OPPORTUNITY_ID]: {
              canCreateAllRecords: false,
              canReadAllRecords: false,
              canUpdateAllRecords: false,
              canSoftDeleteAllRecords: false,
              canDestroyAllRecords: false,
              unreadableFields: [],
              uneditableFields: [],
              rowLevelRecordsPermissions: [
                {
                  ruleId: RULE_ID,
                  canCreateRecords: true,
                  canReadRecords: true,
                  canUpdateRecords: true,
                  canSoftDeleteRecords: true,
                  canDestroyRecords: true,
                  predicates,
                  predicateGroups,
                  unreadableFields: [],
                  uneditableFields: [],
                } satisfies RowLevelRecordsPermissions,
              ],
            },
          },
        },
      },
    },
  });

describe('findAccessGroupValueLookups', () => {
  it('should look up the groups of a member bound relation by its join column', () => {
    expect(
      findLookups({ predicates: [buildPredicate({ id: 'owner-is-me' })] }),
    ).toEqual([
      {
        type: 'RLS_MEMBER_VALUE',
        ruleShapeHash: expect.any(String),
        keys: [
          {
            memberFieldKey: 'workspace-member-id:',
            columnName: 'ownerId',
            relationHop: null,
          },
        ],
        residualRule: { predicates: [], predicateGroups: [] },
      },
    ]);
  });

  it('should look up the groups of a literal value list by its column', () => {
    expect(
      findLookups({
        predicates: [
          buildPredicate({
            id: 'stage-is-listed',
            fieldMetadataId: 'opportunity-stage',
            workspaceMemberFieldMetadataId: null,
            value: ['OPEN', 'WON'],
          }),
        ],
      }),
    ).toEqual([
      {
        type: 'RLS_LITERAL_VALUE',
        ruleShapeHash: expect.any(String),
        keys: [
          { memberFieldKey: null, columnName: 'stage', relationHop: null },
        ],
        residualRule: { predicates: [], predicateGroups: [] },
      },
    ]);
  });

  it('should not look up a literal value list that renders as a text equality', () => {
    expect(
      findLookups({
        predicates: [
          buildPredicate({
            id: 'name-is-listed',
            fieldMetadataId: 'opportunity-name',
            workspaceMemberFieldMetadataId: null,
            value: ['first', 'second'],
          }),
        ],
      }),
    ).toEqual([]);
  });

  it('should look up the groups through a relation hop', () => {
    const [lookup] = findLookups({
      predicates: [
        buildPredicate({
          id: 'account-owner-is-me',
          relationFieldMetadataId: 'opportunity-company',
          fieldMetadataId: 'company-account-owner',
        }),
      ],
    });

    expect(lookup.keys).toEqual([
      {
        memberFieldKey: 'workspace-member-id:',
        columnName: 'accountOwnerId',
        relationHop: {
          targetFlatObjectMetadata: expect.objectContaining({ id: COMPANY_ID }),
          sourceColumnName: 'companyId',
          targetColumnName: 'id',
        },
      },
    ]);
  });

  it('should not look up through a relation hop while hops are disabled', () => {
    expect(
      findLookups({
        predicates: [
          buildPredicate({
            id: 'account-owner-is-me',
            relationFieldMetadataId: 'opportunity-company',
            fieldMetadataId: 'company-account-owner',
          }),
        ],
        isRelationHopEnabled: false,
      }),
    ).toEqual([]);
  });

  it('should keep the predicates that read no member value as the residual condition', () => {
    const namePredicate = buildPredicate({
      id: 'name-contains-deal',
      fieldMetadataId: 'opportunity-name',
      operand: RowLevelPermissionPredicateOperand.CONTAINS,
      workspaceMemberFieldMetadataId: null,
      value: 'deal',
    });
    const [lookup] = findLookups({
      predicates: [buildPredicate({ id: 'owner-is-me' }), namePredicate],
    });

    expect(lookup.keys.map(({ columnName }) => columnName)).toEqual([
      'ownerId',
    ]);
    expect(lookup.residualRule.predicates).toEqual([namePredicate]);
  });

  it('should not look up a rule with a member bound predicate that is not an equality', () => {
    expect(
      findLookups({
        predicates: [
          buildPredicate({ id: 'owner-is-me' }),
          buildPredicate({
            id: 'name-contains-member-locale',
            fieldMetadataId: 'opportunity-name',
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            workspaceMemberFieldMetadataId: 'workspace-member-locale',
          }),
        ],
      }),
    ).toEqual([]);
  });

  it('should only use a key reached through AND groups', () => {
    const orGroup = buildPredicateGroup({
      id: 'or-group',
      logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
    });
    const andGroup = buildPredicateGroup({
      id: 'and-group',
      logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
    });

    expect(
      findLookups({
        predicates: [
          buildPredicate({
            id: 'owner-is-me',
            rowLevelPermissionPredicateGroupId: 'or-group',
          }),
        ],
        predicateGroups: [orGroup],
      }),
    ).toEqual([]);
    expect(
      findLookups({
        predicates: [
          buildPredicate({
            id: 'owner-is-me',
            rowLevelPermissionPredicateGroupId: 'and-group',
          }),
        ],
        predicateGroups: [andGroup],
      }),
    ).toHaveLength(1);
  });

  it('should not look up a rule where two predicates read the same member value', () => {
    expect(
      findLookups({
        predicates: [
          buildPredicate({ id: 'owner-is-me' }),
          buildPredicate({
            id: 'account-owner-is-me',
            relationFieldMetadataId: 'opportunity-company',
            fieldMetadataId: 'company-account-owner',
          }),
        ],
      }),
    ).toEqual([]);
  });
});
