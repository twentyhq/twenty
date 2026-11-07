import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { type FlatRolePermissionFlag } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { resolveUserWorkspaceIdsWithPermissionFlag } from 'src/engine/permissions/role/utils/resolve-user-workspace-ids-with-permission-flag.util';

const FLAT_ENTITY_DEFAULTS = {
  universalIdentifier: 'universal-identifier',
  applicationId: 'application-id',
  applicationUniversalIdentifier: 'application-universal-identifier',
  workspaceId: 'workspace-id',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const buildFlatRole = (
  flatRole: Pick<
    FlatRole,
    | 'id'
    | 'canUpdateAllSettings'
    | 'canAccessAllTools'
    | 'rolePermissionFlagIds'
    | 'roleTargetIds'
  >,
): FlatRole => ({
  ...FLAT_ENTITY_DEFAULTS,
  label: 'Role',
  canAccessAllAgentChatChannels: false,
  canReadAllObjectRecords: false,
  canCreateAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  description: null,
  icon: null,
  isEditable: true,
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: true,
  canBeAssignedToApiKeys: true,
  canBeAssignedToApplications: true,
  objectPermissionIds: [],
  fieldPermissionIds: [],
  agentChatChannelRoleIds: [],
  rowLevelPermissionPredicateIds: [],
  rowLevelPermissionPredicateGroupIds: [],
  roleTargetUniversalIdentifiers: [],
  objectPermissionUniversalIdentifiers: [],
  rolePermissionFlagUniversalIdentifiers: [],
  fieldPermissionUniversalIdentifiers: [],
  agentChatChannelRoleUniversalIdentifiers: [],
  rowLevelPermissionPredicateUniversalIdentifiers: [],
  rowLevelPermissionPredicateGroupUniversalIdentifiers: [],
  ...flatRole,
});

const buildFlatRolePermissionFlag = (
  flatRolePermissionFlag: Pick<
    FlatRolePermissionFlag,
    'id' | 'permissionFlagUniversalIdentifier'
  >,
): FlatRolePermissionFlag => ({
  ...FLAT_ENTITY_DEFAULTS,
  roleId: 'role-id',
  permissionFlagId: 'permission-flag-id',
  roleUniversalIdentifier: 'role-universal-identifier',
  ...flatRolePermissionFlag,
});

const buildFlatRoleTarget = (
  flatRoleTarget: Pick<FlatRoleTarget, 'id' | 'roleId' | 'userWorkspaceId'>,
): FlatRoleTarget => ({
  ...FLAT_ENTITY_DEFAULTS,
  agentId: null,
  apiKeyId: null,
  webhookId: null,
  targetApplicationId: null,
  targetApplicationUniversalIdentifier: null,
  agentUniversalIdentifier: null,
  webhookUniversalIdentifier: null,
  roleUniversalIdentifier: 'role-universal-identifier',
  ...flatRoleTarget,
});

const buildInput = ({
  permissionFlag = PermissionFlagType.WORKFLOWS,
  roles = [],
  roleTargets = [],
}: {
  permissionFlag?: PermissionFlagType;
  roles?: {
    id: string;
    canUpdateAllSettings?: boolean;
    canAccessAllTools?: boolean;
    grantedPermissionFlag?: PermissionFlagType;
  }[];
  roleTargets?: { roleId: string; userWorkspaceId: string | null }[];
}) => {
  const rolePermissionFlagMaps = roles.flatMap((role) =>
    role.grantedPermissionFlag
      ? [
          {
            rolePermissionFlagId: `role-permission-flag-${role.id}`,
            permissionFlagUniversalIdentifier:
              SystemPermissionFlag[role.grantedPermissionFlag],
          },
        ]
      : [],
  );

  return {
    permissionFlag,
    flatRoleMaps: {
      byUniversalIdentifier: Object.fromEntries(
        roles.map((role) => [
          role.id,
          buildFlatRole({
            id: role.id,
            canUpdateAllSettings: role.canUpdateAllSettings ?? false,
            canAccessAllTools: role.canAccessAllTools ?? false,
            rolePermissionFlagIds: role.grantedPermissionFlag
              ? [`role-permission-flag-${role.id}`]
              : [],
            roleTargetIds: roleTargets.flatMap((roleTarget, index) =>
              roleTarget.roleId === role.id ? [`role-target-${index}`] : [],
            ),
          }),
        ]),
      ),
      universalIdentifierById: {},
      universalIdentifiersByApplicationId: {},
    },
    flatRolePermissionFlagMaps: {
      byUniversalIdentifier: Object.fromEntries(
        rolePermissionFlagMaps.map((entry) => [
          entry.rolePermissionFlagId,
          buildFlatRolePermissionFlag({
            id: entry.rolePermissionFlagId,
            permissionFlagUniversalIdentifier:
              entry.permissionFlagUniversalIdentifier,
          }),
        ]),
      ),
      universalIdentifierById: Object.fromEntries(
        rolePermissionFlagMaps.map((entry) => [
          entry.rolePermissionFlagId,
          entry.rolePermissionFlagId,
        ]),
      ),
      universalIdentifiersByApplicationId: {},
    },
    flatRoleTargetMaps: {
      byUniversalIdentifier: Object.fromEntries(
        roleTargets.map((roleTarget, index) => [
          `role-target-${index}`,
          buildFlatRoleTarget({ id: `role-target-${index}`, ...roleTarget }),
        ]),
      ),
      universalIdentifierById: Object.fromEntries(
        roleTargets.map((_, index) => [
          `role-target-${index}`,
          `role-target-${index}`,
        ]),
      ),
      universalIdentifiersByApplicationId: {},
    },
  };
};

describe('resolveUserWorkspaceIdsWithPermissionFlag', () => {
  it('returns no recipient when no role holds the flag', () => {
    expect(
      resolveUserWorkspaceIdsWithPermissionFlag(
        buildInput({
          roles: [{ id: 'role-1' }],
          roleTargets: [{ roleId: 'role-1', userWorkspaceId: 'uw-1' }],
        }),
      ),
    ).toEqual([]);
  });

  it('includes members of a role granted the flag', () => {
    expect(
      resolveUserWorkspaceIdsWithPermissionFlag(
        buildInput({
          roles: [
            {
              id: 'role-1',
              grantedPermissionFlag: PermissionFlagType.WORKFLOWS,
            },
          ],
          roleTargets: [{ roleId: 'role-1', userWorkspaceId: 'uw-1' }],
        }),
      ),
    ).toEqual(['uw-1']);
  });

  it('includes members of a role that can update all settings', () => {
    expect(
      resolveUserWorkspaceIdsWithPermissionFlag(
        buildInput({
          roles: [{ id: 'admin-role', canUpdateAllSettings: true }],
          roleTargets: [{ roleId: 'admin-role', userWorkspaceId: 'uw-admin' }],
        }),
      ),
    ).toEqual(['uw-admin']);
  });

  it('uses the tool base permission for a tool flag', () => {
    const roles = [
      { id: 'tool-role', canAccessAllTools: true },
      { id: 'settings-role', canUpdateAllSettings: true },
    ];
    const roleTargets = [
      { roleId: 'tool-role', userWorkspaceId: 'uw-tool' },
      { roleId: 'settings-role', userWorkspaceId: 'uw-settings' },
    ];

    expect(
      resolveUserWorkspaceIdsWithPermissionFlag(
        buildInput({
          permissionFlag: PermissionFlagType.VIEWS,
          roles,
          roleTargets,
        }),
      ),
    ).toEqual(['uw-tool']);

    expect(
      resolveUserWorkspaceIdsWithPermissionFlag(
        buildInput({
          permissionFlag: PermissionFlagType.WORKFLOWS,
          roles,
          roleTargets,
        }),
      ),
    ).toEqual(['uw-settings']);
  });

  it('ignores another flag and non-user targets, and deduplicates', () => {
    expect(
      resolveUserWorkspaceIdsWithPermissionFlag(
        buildInput({
          roles: [
            {
              id: 'role-1',
              grantedPermissionFlag: PermissionFlagType.DATA_MODEL,
            },
            { id: 'role-2', canUpdateAllSettings: true },
          ],
          roleTargets: [
            { roleId: 'role-1', userWorkspaceId: 'uw-1' },
            { roleId: 'role-2', userWorkspaceId: 'uw-2' },
            { roleId: 'role-2', userWorkspaceId: 'uw-2' },
            { roleId: 'role-2', userWorkspaceId: null },
          ],
        }),
      ),
    ).toEqual(['uw-2']);
  });
});
