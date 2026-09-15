import { PermissionFlagType } from 'twenty-shared/constants';

import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { fromRoleEntityToRoleDto } from 'src/engine/metadata-modules/role/utils/fromRoleEntityToRoleDto.util';

const buildRoleEntity = (overrides: Partial<RoleEntity> = {}): RoleEntity =>
  ({
    id: 'role-id',
    label: 'Role',
    universalIdentifier: 'role-universal-identifier',
    canUpdateAllSettings: false,
    canAccessAllTools: false,
    description: null,
    icon: null,
    isEditable: true,
    canReadAllObjectRecords: false,
    canUpdateAllObjectRecords: false,
    canSoftDeleteAllObjectRecords: false,
    canDestroyAllObjectRecords: false,
    canBeAssignedToUsers: true,
    canBeAssignedToAgents: true,
    canBeAssignedToApiKeys: true,
    roleTargets: [],
    objectPermissions: [],
    fieldPermissions: [],
    rolePermissionFlags: [],
    ...overrides,
  }) as RoleEntity;

describe('fromRoleEntityToRoleDto', () => {
  it('returns undefined permission flags when role permission flags are not loaded', () => {
    const roleDto = fromRoleEntityToRoleDto(
      buildRoleEntity({
        rolePermissionFlags:
          undefined as unknown as RoleEntity['rolePermissionFlags'],
      }),
    );

    expect(roleDto.permissionFlags).toBeUndefined();
  });

  it('maps loaded role permission flags to the public permission flag DTO shape', () => {
    const roleDto = fromRoleEntityToRoleDto(
      buildRoleEntity({
        rolePermissionFlags: [
          {
            id: 'role-permission-flag-id',
            roleId: 'role-id',
            permissionFlag: {
              key: PermissionFlagType.WORKSPACE,
            },
          },
        ] as RoleEntity['rolePermissionFlags'],
      }),
    );

    expect(roleDto.permissionFlags).toEqual([
      {
        id: 'role-permission-flag-id',
        roleId: 'role-id',
        flag: PermissionFlagType.WORKSPACE,
      },
    ]);
  });
});
