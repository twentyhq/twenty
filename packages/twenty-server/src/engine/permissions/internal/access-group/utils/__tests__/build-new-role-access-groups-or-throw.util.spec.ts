import {
  FieldMetadataType,
  type ObjectRecordsPermissions,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildNewRoleAccessGroupsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-new-role-access-groups-or-throw.util';

const ROLE_ID = 'role-id';
const OBJECT_METADATA_ID = 'object-metadata-id';
const MEMBER_FIELD_ID = 'member-field-id';
const RULE_ID = 'rule-id';
const MEMBER_FIELD_KEY = `${MEMBER_FIELD_ID}:`;

const flatFieldMetadataMaps = {
  byId: {
    [MEMBER_FIELD_ID]: {
      id: MEMBER_FIELD_ID,
      name: 'teams',
      type: FieldMetadataType.ARRAY,
    },
  },
  idByUniversalIdentifier: {},
  byUniversalIdentifier: {
    [MEMBER_FIELD_ID]: {
      id: MEMBER_FIELD_ID,
      name: 'teams',
      type: FieldMetadataType.ARRAY,
    },
  },
  universalIdentifierById: { [MEMBER_FIELD_ID]: MEMBER_FIELD_ID },
  universalIdentifiersByApplicationId: {},
} as unknown as FlatEntityMaps<OrmFlatFieldMetadata>;

const noAccess: ObjectRecordsPermissions = {
  canCreateAllRecords: false,
  canReadAllRecords: false,
  canUpdateAllRecords: false,
  canSoftDeleteAllRecords: false,
  canDestroyAllRecords: false,
  restrictedFields: {},
};

const buildRowLevelPermissions = (
  predicates: Partial<RowLevelPermissionPredicate>[],
): ObjectRecordsPermissions => ({
  ...noAccess,
  rowLevelRecordsPermissions: {
    canCreateRecords: false,
    canReadRecords: true,
    canUpdateRecords: false,
    canSoftDeleteRecords: false,
    canDestroyRecords: false,
    predicates: predicates as RowLevelPermissionPredicate[],
    predicateGroups: [
      { id: RULE_ID, parentRowLevelPermissionPredicateGroupId: null },
      { id: 'nested', parentRowLevelPermissionPredicateGroupId: RULE_ID },
    ] as RowLevelPermissionPredicateGroup[],
  },
});

const build = (
  overrides: Pick<
    Parameters<typeof buildNewRoleAccessGroupsOrThrow>[0],
    'objectRecordsPermissions'
  > &
    Partial<Parameters<typeof buildNewRoleAccessGroupsOrThrow>[0]>,
) =>
  buildNewRoleAccessGroupsOrThrow({
    roleId: ROLE_ID,
    objectMetadataId: OBJECT_METADATA_ID,
    workspaceMembers: [],
    flatFieldMetadataMaps,
    ...overrides,
  });

describe('buildNewRoleAccessGroupsOrThrow', () => {
  it('should make no group for a role with no access', () => {
    expect(build({ objectRecordsPermissions: noAccess })).toEqual([]);
    expect(build({ objectRecordsPermissions: undefined })).toEqual([]);
  });

  it('should make one all records group, different for each object', () => {
    const [newAccessGroup] = build({
      objectRecordsPermissions: { ...noAccess, canReadAllRecords: true },
    });
    const [otherObjectNewAccessGroup] = build({
      objectRecordsPermissions: { ...noAccess, canReadAllRecords: true },
      objectMetadataId: 'other-object-metadata-id',
    });

    expect(newAccessGroup.rowLevelPermissionPredicateGroupId).toBeNull();
    expect(newAccessGroup.memberFieldValues).toBeNull();
    expect(newAccessGroup.groupHash).not.toBe(
      otherObjectNewAccessGroup.groupHash,
    );
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
    const newAccessGroups = build({
      objectRecordsPermissions: buildRowLevelPermissions([
        { id: 'predicate', rowLevelPermissionPredicateGroupId: RULE_ID },
      ]),
    });

    expect(newAccessGroups).toHaveLength(1);
    expect(newAccessGroups[0].rowLevelPermissionPredicateGroupId).toBe(RULE_ID);
    expect(newAccessGroups[0].memberFieldValues).toBeNull();
  });

  it('should make one group per list value, shared by members with the same value', () => {
    const newAccessGroups = build({
      objectRecordsPermissions: buildRowLevelPermissions([
        {
          id: 'predicate',
          workspaceMemberFieldMetadataId: MEMBER_FIELD_ID,
          rowLevelPermissionPredicateGroupId: RULE_ID,
        },
      ]),
      workspaceMembers: [
        { id: 'jane', teams: ['sales', 'support'] },
        { id: 'bob', teams: ['sales'] },
      ] as never,
    });
    const uniqueGroupHashes = new Set(
      newAccessGroups.map((newAccessGroup) => newAccessGroup.groupHash),
    );

    expect(uniqueGroupHashes.size).toBe(2);
    expect(
      newAccessGroups.map((newAccessGroup) => newAccessGroup.memberFieldValues),
    ).toEqual([
      { [MEMBER_FIELD_KEY]: 'sales' },
      { [MEMBER_FIELD_KEY]: 'support' },
      { [MEMBER_FIELD_KEY]: 'sales' },
    ]);
  });

  it('should make one rule per role and object, whatever the predicates hang on', () => {
    const permissions = buildRowLevelPermissions([
      {
        id: 'bound',
        workspaceMemberFieldMetadataId: MEMBER_FIELD_ID,
        rowLevelPermissionPredicateGroupId: 'nested',
      },
      { id: 'ungrouped', rowLevelPermissionPredicateGroupId: null },
    ]);

    permissions.rowLevelRecordsPermissions?.predicateGroups.push({
      id: 'other-root',
      parentRowLevelPermissionPredicateGroupId: null,
    } as RowLevelPermissionPredicateGroup);

    const newAccessGroups = build({
      objectRecordsPermissions: permissions,
      workspaceMembers: [{ id: 'jane', teams: ['sales', 'support'] }] as never,
    });

    expect(
      newAccessGroups.map((newAccessGroup) => [
        newAccessGroup.rowLevelPermissionPredicateGroupId,
        newAccessGroup.memberFieldValues,
      ]),
    ).toEqual([
      [RULE_ID, { [MEMBER_FIELD_KEY]: 'sales' }],
      [RULE_ID, { [MEMBER_FIELD_KEY]: 'support' }],
    ]);
  });

  it('should make a group for predicates without a predicate group', () => {
    const permissions = buildRowLevelPermissions([
      { id: 'ungrouped', rowLevelPermissionPredicateGroupId: null },
    ]);

    if (isDefined(permissions.rowLevelRecordsPermissions)) {
      permissions.rowLevelRecordsPermissions.predicateGroups = [];
    }

    expect(
      build({ objectRecordsPermissions: permissions }).map(
        (newAccessGroup) => newAccessGroup.rowLevelPermissionPredicateGroupId,
      ),
    ).toEqual([null]);
  });

  it('should make no member group when no member holds the role', () => {
    expect(
      build({
        objectRecordsPermissions: buildRowLevelPermissions([
          {
            id: 'predicate',
            workspaceMemberFieldMetadataId: MEMBER_FIELD_ID,
            rowLevelPermissionPredicateGroupId: RULE_ID,
          },
        ]),
      }),
    ).toEqual([]);
  });
});
