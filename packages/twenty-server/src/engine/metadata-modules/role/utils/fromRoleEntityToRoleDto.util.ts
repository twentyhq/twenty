import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

export const fromRoleEntityToRoleDto = (role: RoleEntity): RoleDTO => {
  return {
    id: role.id,
    label: role.label,
    canUpdateAllSettings: role.canUpdateAllSettings,
    canReadAllObjectRecords: role.canReadAllObjectRecords,
    canUpdateAllObjectRecords: role.canUpdateAllObjectRecords,
    canSoftDeleteAllObjectRecords: role.canSoftDeleteAllObjectRecords,
    canDestroyAllObjectRecords: role.canDestroyAllObjectRecords,
    description: role.description,
    icon: role.icon,
    workspaceId: role.workspaceId,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
    isEditable: role.isEditable,
    roleTargets: role.roleTargets,
    objectPermissions: role.objectPermissions,
    settingPermissions: role.settingPermissions,
  };
};

export const fromRoleEntitiesToRoleDtos = (roleEntities: RoleEntity[]) =>
  roleEntities.map(fromRoleEntityToRoleDto);
