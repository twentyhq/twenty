import {
  FieldMetadataType,
  type ObjectRecordsPermissions,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { buildRoleAccessGroupsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-role-access-groups-or-throw.util';

const ROLE_ID = 'role-id';
const OBJECT_METADATA_ID = 'object-metadata-id';
const MEMBER_FIELD_ID = 'member-field-id';
const RULE_ID = 'rule-id';
const MEMBER_FIELD_KEY = `${MEMBER_FIELD_ID}:`;

const flatFieldMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: getFlatFieldMetadataMock({
    id: MEMBER_FIELD_ID,
    universalIdentifier: MEMBER_FIELD_ID,
    objectMetadataId: 'workspace-member-object-id',
    type: FieldMetadataType.ARRAY,
    name: 'teams',
  }),
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

const JANE = { id: 'jane', teams: ['sales', 'support'] };
const BOB = { id: 'bob', teams: ['sales'] };

const noAccess: ObjectRecordsPermissions = {
  canCreateAllRecords: false,
  canReadAllRecords: false,
  canUpdateAllRecords: false,
  canSoftDeleteAllRecords: false,
  canDestroyAllRecords: false,
  unreadableFields: [],
  uneditableFields: [],
};

const buildPredicate = (
  overrides: Pick<RowLevelPermissionPredicate, 'id'> &
    Partial<RowLevelPermissionPredicate>,
): RowLevelPermissionPredicate => ({
  fieldMetadataId: 'field-id',
  objectMetadataId: OBJECT_METADATA_ID,
  operand: RowLevelPermissionPredicateOperand.IS,
  value: null,
  subFieldName: null,
  rowLevelPermissionPredicateGroupId: RULE_ID,
  workspaceMemberFieldMetadataId: null,
  workspaceMemberSubFieldName: null,
  roleId: ROLE_ID,
  ...overrides,
});

const buildPredicateGroup = ({
  id,
  parentRowLevelPermissionPredicateGroupId,
}: Pick<
  RowLevelPermissionPredicateGroup,
  'id' | 'parentRowLevelPermissionPredicateGroupId'
>): RowLevelPermissionPredicateGroup => ({
  id,
  parentRowLevelPermissionPredicateGroupId,
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
  objectMetadataId: OBJECT_METADATA_ID,
  positionInRowLevelPermissionPredicateGroup: null,
  canReadRecords: true,
  canUpdateRecords: false,
  canSoftDeleteRecords: false,
  canDestroyRecords: false,
  roleId: ROLE_ID,
});

const ROOT_AND_NESTED_GROUPS = [
  buildPredicateGroup({
    id: RULE_ID,
    parentRowLevelPermissionPredicateGroupId: null,
  }),
  buildPredicateGroup({
    id: 'nested',
    parentRowLevelPermissionPredicateGroupId: RULE_ID,
  }),
];

const buildRowLevelPermissions = ({
  predicates,
  predicateGroups = ROOT_AND_NESTED_GROUPS,
}: {
  predicates: RowLevelPermissionPredicate[];
  predicateGroups?: RowLevelPermissionPredicateGroup[];
}): ObjectRecordsPermissions => ({
  ...noAccess,
  rowLevelRecordsPermissions: {
    canCreateRecords: false,
    canReadRecords: true,
    canUpdateRecords: false,
    canSoftDeleteRecords: false,
    canDestroyRecords: false,
    predicates,
    predicateGroups,
  },
});

const UNGROUPED_RULE_PERMISSIONS = buildRowLevelPermissions({
  predicates: [
    buildPredicate({
      id: 'ungrouped',
      rowLevelPermissionPredicateGroupId: null,
    }),
  ],
  predicateGroups: [],
});

const build = (
  overrides: Pick<
    Parameters<typeof buildRoleAccessGroupsOrThrow>[0],
    'objectRecordsPermissions'
  > &
    Partial<Parameters<typeof buildRoleAccessGroupsOrThrow>[0]>,
) =>
  buildRoleAccessGroupsOrThrow({
    roleId: ROLE_ID,
    objectMetadataId: OBJECT_METADATA_ID,
    workspaceMembers: [],
    flatFieldMetadataMaps,
    isRelationHopEnabled: true,
    ...overrides,
  });

describe('buildRoleAccessGroupsOrThrow', () => {
  it('should make no group for a role with no access', () => {
    expect(build({ objectRecordsPermissions: noAccess })).toEqual([]);
    expect(build({ objectRecordsPermissions: undefined })).toEqual([]);
  });

  it('should make one all records group, different for each object', () => {
    const [accessGroup] = build({
      objectRecordsPermissions: { ...noAccess, canReadAllRecords: true },
    });
    const [otherObjectAccessGroup] = build({
      objectRecordsPermissions: { ...noAccess, canReadAllRecords: true },
      objectMetadataId: 'other-object-metadata-id',
    });

    expect(accessGroup.rowLevelPermissionPredicateGroupId).toBeNull();
    expect(accessGroup.memberFieldValues).toBeNull();
    expect(accessGroup.groupHash).not.toBe(otherObjectAccessGroup.groupHash);
  });

  it('should only count the asked operation', () => {
    const permissions = { ...noAccess, canReadAllRecords: true };

    expect(
      build({
        objectRecordsPermissions: permissions,
        operationTypes: ['read'],
      }),
    ).toHaveLength(1);
    expect(
      build({
        objectRecordsPermissions: permissions,
        operationTypes: ['update'],
      }),
    ).toEqual([]);
  });

  it('should make one group for a root rule without member values', () => {
    const accessGroups = build({
      objectRecordsPermissions: buildRowLevelPermissions({
        predicates: [buildPredicate({ id: 'predicate' })],
      }),
    });

    expect(accessGroups).toHaveLength(1);
    expect(accessGroups[0].rowLevelPermissionPredicateGroupId).toBe(RULE_ID);
    expect(accessGroups[0].memberFieldValues).toBeNull();
  });

  it('should make one group per list value, shared by members with the same value', () => {
    const accessGroups = build({
      objectRecordsPermissions: buildRowLevelPermissions({
        predicates: [
          buildPredicate({
            id: 'predicate',
            workspaceMemberFieldMetadataId: MEMBER_FIELD_ID,
          }),
        ],
      }),
      workspaceMembers: [JANE, BOB],
    });
    const uniqueGroupHashes = new Set(
      accessGroups.map((accessGroup) => accessGroup.groupHash),
    );

    expect(uniqueGroupHashes.size).toBe(2);
    expect(
      accessGroups.map((accessGroup) => accessGroup.memberFieldValues),
    ).toEqual([
      { [MEMBER_FIELD_KEY]: 'sales' },
      { [MEMBER_FIELD_KEY]: 'support' },
      { [MEMBER_FIELD_KEY]: 'sales' },
    ]);
  });

  it('should keep the whole list in one group when the rule excludes values', () => {
    const accessGroups = build({
      objectRecordsPermissions: buildRowLevelPermissions({
        predicates: [
          buildPredicate({
            id: 'predicate',
            operand: RowLevelPermissionPredicateOperand.IS_NOT,
            workspaceMemberFieldMetadataId: MEMBER_FIELD_ID,
          }),
        ],
      }),
      workspaceMembers: [{ ...JANE, teams: ['support', 'sales'] }, BOB],
    });

    expect(
      accessGroups.map((accessGroup) => accessGroup.memberFieldValues),
    ).toEqual([
      { [MEMBER_FIELD_KEY]: ['sales', 'support'] },
      { [MEMBER_FIELD_KEY]: ['sales'] },
    ]);
  });

  it('should keep the whole list in one group when two predicates read it', () => {
    const accessGroups = build({
      objectRecordsPermissions: buildRowLevelPermissions({
        predicates: [
          buildPredicate({
            id: 'first',
            workspaceMemberFieldMetadataId: MEMBER_FIELD_ID,
          }),
          buildPredicate({
            id: 'second',
            fieldMetadataId: 'other-field-id',
            workspaceMemberFieldMetadataId: MEMBER_FIELD_ID,
          }),
        ],
      }),
      workspaceMembers: [JANE],
    });

    expect(
      accessGroups.map((accessGroup) => accessGroup.memberFieldValues),
    ).toEqual([{ [MEMBER_FIELD_KEY]: ['sales', 'support'] }]);
  });

  it('should make one rule per role and object, whatever the predicates hang on', () => {
    const accessGroups = build({
      objectRecordsPermissions: buildRowLevelPermissions({
        predicates: [
          buildPredicate({
            id: 'bound',
            workspaceMemberFieldMetadataId: MEMBER_FIELD_ID,
            rowLevelPermissionPredicateGroupId: 'nested',
          }),
          buildPredicate({
            id: 'ungrouped',
            rowLevelPermissionPredicateGroupId: null,
          }),
        ],
        predicateGroups: [
          ...ROOT_AND_NESTED_GROUPS,
          buildPredicateGroup({
            id: 'other-root',
            parentRowLevelPermissionPredicateGroupId: null,
          }),
        ],
      }),
      workspaceMembers: [JANE],
    });

    expect(
      accessGroups.map((accessGroup) => [
        accessGroup.rowLevelPermissionPredicateGroupId,
        accessGroup.memberFieldValues,
      ]),
    ).toEqual([
      [RULE_ID, { [MEMBER_FIELD_KEY]: 'sales' }],
      [RULE_ID, { [MEMBER_FIELD_KEY]: 'support' }],
    ]);
  });

  it('should make a group for predicates without a predicate group', () => {
    expect(
      build({ objectRecordsPermissions: UNGROUPED_RULE_PERMISSIONS }).map(
        (accessGroup) => accessGroup.rowLevelPermissionPredicateGroupId,
      ),
    ).toEqual([null]);
  });

  it('should not give predicates without a predicate group the hash of an all records group', () => {
    const [ruleAccessGroup] = build({
      objectRecordsPermissions: UNGROUPED_RULE_PERMISSIONS,
    });
    const [allRecordsAccessGroup] = build({
      objectRecordsPermissions: { ...noAccess, canReadAllRecords: true },
    });

    expect(ruleAccessGroup.groupHash).not.toBe(allRecordsAccessGroup.groupHash);
  });

  it('should change the hash when the content of a rule changes', () => {
    const buildHash = (value: string) =>
      build({
        objectRecordsPermissions: buildRowLevelPermissions({
          predicates: [buildPredicate({ id: 'predicate', value })],
        }),
      })[0].groupHash;

    expect(buildHash('Paris')).not.toBe(buildHash('London'));
  });

  it('should keep the hash when ids below the root, order or operation flags change', () => {
    const firstPredicate = buildPredicate({ id: 'first', value: 'Paris' });
    const secondPredicate = buildPredicate({
      id: 'second',
      value: 'London',
      rowLevelPermissionPredicateGroupId: 'nested',
    });
    const [accessGroup] = build({
      objectRecordsPermissions: buildRowLevelPermissions({
        predicates: [firstPredicate, secondPredicate],
      }),
    });
    const [sameRuleAccessGroup] = build({
      objectRecordsPermissions: buildRowLevelPermissions({
        predicates: [
          {
            ...secondPredicate,
            id: 'other-second',
            rowLevelPermissionPredicateGroupId: 'other-nested',
          },
          { ...firstPredicate, id: 'other-first' },
        ],
        predicateGroups: [
          buildPredicateGroup({
            id: 'other-nested',
            parentRowLevelPermissionPredicateGroupId: RULE_ID,
          }),
          buildPredicateGroup({
            id: RULE_ID,
            parentRowLevelPermissionPredicateGroupId: null,
          }),
        ].map((predicateGroup) => ({
          ...predicateGroup,
          positionInRowLevelPermissionPredicateGroup: 1,
          canUpdateRecords: true,
        })),
      }),
    });

    expect(sameRuleAccessGroup.groupHash).toBe(accessGroup.groupHash);
  });

  it('should change the hash when a predicate moves to another group', () => {
    const buildHash = (rowLevelPermissionPredicateGroupId: string) =>
      build({
        objectRecordsPermissions: buildRowLevelPermissions({
          predicates: [
            buildPredicate({ id: 'first', value: 'Paris' }),
            buildPredicate({
              id: 'second',
              value: 'London',
              rowLevelPermissionPredicateGroupId,
            }),
          ],
        }),
      })[0].groupHash;

    expect(buildHash(RULE_ID)).not.toBe(buildHash('nested'));
  });

  it('should make no member group when no member holds the role', () => {
    expect(
      build({
        objectRecordsPermissions: buildRowLevelPermissions({
          predicates: [
            buildPredicate({
              id: 'predicate',
              workspaceMemberFieldMetadataId: MEMBER_FIELD_ID,
            }),
          ],
        }),
      }),
    ).toEqual([]);
  });
});
