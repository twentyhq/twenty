import { type RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

export const fromRoleEntityToRoleDto = (role: RoleEntity): RoleDTO => {
  return {
    id: role.id,
    standardId: role.standardId ?? undefined,
    label: role.label,
    canUpdateAllSettings: role.canUpdateAllSettings,
    canAccessAllTools: role.canAccessAllTools,
    description: role.description ?? undefined,
    icon: role.icon ?? undefined,
    isEditable: role.isEditable,
    canReadAllObjectRecords: role.canReadAllObjectRecords,
    canUpdateAllObjectRecords: role.canUpdateAllObjectRecords,
    canSoftDeleteAllObjectRecords: role.canSoftDeleteAllObjectRecords,
    canDestroyAllObjectRecords: role.canDestroyAllObjectRecords,
    canBeAssignedToUsers: role.canBeAssignedToUsers,
    canBeAssignedToAgents: role.canBeAssignedToAgents,
    canBeAssignedToApiKeys: role.canBeAssignedToApiKeys,
    roleTargets: role.roleTargets,
    permissionFlags: role.permissionFlags,
    objectPermissions: role.objectPermissions,
    fieldPermissions: role.fieldPermissions,
  };
};

export const fromRoleEntitiesToRoleDtos = (roleEntities: RoleEntity[]) =>
  roleEntities.map(fromRoleEntityToRoleDto);
