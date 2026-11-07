import {
  FieldMetadataType,
  type ObjectRecordsPermissions,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
} from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildRoleAccessGroupDefinitionsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-role-access-group-definitions-or-throw.util';

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
  objectRecordsPermissions: ObjectRecordsPermissions | undefined,
  overrides: Partial<
    Parameters<typeof buildRoleAccessGroupDefinitionsOrThrow>[0]
  > = {},
) =>
  buildRoleAccessGroupDefinitionsOrThrow({
    roleId: ROLE_ID,
    objectMetadataId: OBJECT_METADATA_ID,
    objectRecordsPermissions,
    workspaceMembers: [],
    flatFieldMetadataMaps,
    ...overrides,
  });

describe('buildRoleAccessGroupDefinitionsOrThrow', () => {
  it('should make no group for a role with no access', () => {
    expect(build(noAccess)).toEqual([]);
    expect(build(undefined)).toEqual([]);
  });

  it('should make one all records group, different for each object', () => {
    const [definition] = build({ ...noAccess, canReadAllRecords: true });
    const [otherObjectDefinition] = build(
      { ...noAccess, canReadAllRecords: true },
      { objectMetadataId: 'other-object-metadata-id' },
    );

    expect(definition.rowLevelPermissionPredicateGroupId).toBeNull();
    expect(definition.memberFieldValues).toBeNull();
    expect(definition.groupHash).not.toBe(otherObjectDefinition.groupHash);
  });

  it('should only count the asked operation', () => {
    const permissions = { ...noAccess, canReadAllRecords: true };

    expect(build(permissions, { operationTypes: ['read'] })).toHaveLength(1);
    expect(build(permissions, { operationTypes: ['update'] })).toEqual([]);
  });

  it('should make one group for a root rule without member values', () => {
    const definitions = build(buildRowLevelPermissions([{ id: 'predicate' }]));

    expect(definitions).toHaveLength(1);
    expect(definitions[0].rowLevelPermissionPredicateGroupId).toBe(RULE_ID);
    expect(definitions[0].memberFieldValues).toBeNull();
  });

  it('should make one group per list value, shared by members with the same value', () => {
    const definitions = build(
      buildRowLevelPermissions([
        {
          id: 'predicate',
          workspaceMemberFieldMetadataId: MEMBER_FIELD_ID,
          rowLevelPermissionPredicateGroupId: RULE_ID,
        },
      ]),
      {
        workspaceMembers: [
          { id: 'jane', teams: ['sales', 'support'] },
          { id: 'bob', teams: ['sales'] },
        ] as never,
      },
    );
    const uniqueGroupHashes = new Set(definitions.map((d) => d.groupHash));

    expect(uniqueGroupHashes.size).toBe(2);
    expect(definitions.map((d) => d.memberFieldValues)).toEqual([
      { [MEMBER_FIELD_KEY]: 'sales' },
      { [MEMBER_FIELD_KEY]: 'support' },
      { [MEMBER_FIELD_KEY]: 'sales' },
    ]);
  });

  it('should only split a root rule on the member values of its own predicates', () => {
    const permissions = buildRowLevelPermissions([
      {
        id: 'bound',
        workspaceMemberFieldMetadataId: MEMBER_FIELD_ID,
        rowLevelPermissionPredicateGroupId: 'nested',
      },
    ]);

    permissions.rowLevelRecordsPermissions?.predicateGroups.push({
      id: 'other-root',
      parentRowLevelPermissionPredicateGroupId: null,
    } as RowLevelPermissionPredicateGroup);

    const definitions = build(permissions, {
      workspaceMembers: [{ id: 'jane', teams: ['sales', 'support'] }] as never,
    });

    expect(
      definitions.map((definition) => [
        definition.rowLevelPermissionPredicateGroupId,
        definition.memberFieldValues,
      ]),
    ).toEqual([
      [RULE_ID, { [MEMBER_FIELD_KEY]: 'sales' }],
      [RULE_ID, { [MEMBER_FIELD_KEY]: 'support' }],
      ['other-root', null],
    ]);
  });

  it('should make no member group when no member holds the role', () => {
    expect(
      build(
        buildRowLevelPermissions([
          {
            id: 'predicate',
            workspaceMemberFieldMetadataId: MEMBER_FIELD_ID,
            rowLevelPermissionPredicateGroupId: RULE_ID,
          },
        ]),
      ),
    ).toEqual([]);
  });
});
