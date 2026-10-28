import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { RolePermissionFlagEntity } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { fromRoleEntityToRoleDto } from 'src/engine/metadata-modules/role/utils/fromRoleEntityToRoleDto.util';

const buildRoleEntity = (overrides: Partial<RoleEntity> = {}): RoleEntity =>
  Object.assign(new RoleEntity(), {
    id: 'role-id',
    label: 'Role',
    universalIdentifier: 'role-universal-identifier',
    applicationId: 'application-id',
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
  });

const buildRolePermissionFlagEntity = (
  permissionFlag: Pick<PermissionFlagEntity, 'universalIdentifier' | 'key'>,
): RolePermissionFlagEntity =>
  Object.assign(new RolePermissionFlagEntity(), {
    id: 'role-permission-flag-id',
    roleId: 'role-id',
    permissionFlag: Object.assign(new PermissionFlagEntity(), permissionFlag),
  });

describe('fromRoleEntityToRoleDto', () => {
  it('exposes the id of the application owning the role', () => {
    const roleDto = fromRoleEntityToRoleDto(buildRoleEntity());

    expect(roleDto.applicationId).toBe('application-id');
  });

  it('returns undefined permission flags when role permission flags are not loaded', () => {
    const roleDto = fromRoleEntityToRoleDto(
      buildRoleEntity({ rolePermissionFlags: undefined }),
    );

    expect(roleDto.permissionFlags).toBeUndefined();
  });

  it('maps loaded role permission flags to the public permission flag DTO shape', () => {
    const roleDto = fromRoleEntityToRoleDto(
      buildRoleEntity({
        rolePermissionFlags: [
          buildRolePermissionFlagEntity({
            universalIdentifier: 'permission-flag-universal-identifier',
            key: PermissionFlagType.WORKSPACE,
          }),
        ],
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

  it('upgrade:2-53:rename-app-permission-flag-keys exposes the code key of a standard flag stored under a different key', () => {
    const roleDto = fromRoleEntityToRoleDto(
      buildRoleEntity({
        rolePermissionFlags: [
          buildRolePermissionFlagEntity({
            universalIdentifier: SystemPermissionFlag.APPLICATIONS,
            key: 'WORKSPACE_APPS',
          }),
        ],
      }),
    );

    expect(roleDto.permissionFlags?.[0].flag).toBe(
      PermissionFlagType.APPLICATIONS,
    );
  });

  it('exposes the stored key of an app-defined flag', () => {
    const roleDto = fromRoleEntityToRoleDto(
      buildRoleEntity({
        rolePermissionFlags: [
          buildRolePermissionFlagEntity({
            universalIdentifier: '0b6c3a51-7a54-4ef6-8d4e-0f3f0a4b9b1e',
            key: 'CAN_EXPORT_INVOICES',
          }),
        ],
      }),
    );

    expect(roleDto.permissionFlags?.[0].flag).toBe('CAN_EXPORT_INVOICES');
  });
});
