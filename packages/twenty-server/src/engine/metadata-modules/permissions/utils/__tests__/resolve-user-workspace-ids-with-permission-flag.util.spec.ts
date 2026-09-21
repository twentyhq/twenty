import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { type FlatRolePermissionFlagMaps } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag-maps.type';
import { type FlatRoleTargetMaps } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target-maps.type';
import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';
import { resolveUserWorkspaceIdsWithPermissionFlag } from 'src/engine/metadata-modules/permissions/utils/resolve-user-workspace-ids-with-permission-flag.util';

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
          {
            id: role.id,
            canUpdateAllSettings: role.canUpdateAllSettings ?? false,
            canAccessAllTools: role.canAccessAllTools ?? false,
            rolePermissionFlagIds: role.grantedPermissionFlag
              ? [`role-permission-flag-${role.id}`]
              : [],
          },
        ]),
      ),
    } as unknown as FlatRoleMaps,
    flatRolePermissionFlagMaps: {
      byUniversalIdentifier: Object.fromEntries(
        rolePermissionFlagMaps.map((entry) => [
          entry.rolePermissionFlagId,
          {
            permissionFlagUniversalIdentifier:
              entry.permissionFlagUniversalIdentifier,
          },
        ]),
      ),
      universalIdentifierById: Object.fromEntries(
        rolePermissionFlagMaps.map((entry) => [
          entry.rolePermissionFlagId,
          entry.rolePermissionFlagId,
        ]),
      ),
    } as unknown as FlatRolePermissionFlagMaps,
    flatRoleTargetMaps: {
      byUniversalIdentifier: Object.fromEntries(
        roleTargets.map((roleTarget, index) => [
          `role-target-${index}`,
          roleTarget,
        ]),
      ),
    } as unknown as FlatRoleTargetMaps,
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
