import { type RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

export const fromRoleEntityToRoleDto = (role: RoleEntity): RoleDTO => {
  return {
    id: role.id,
    standardId: role.standardId,
    label: role.label,
    canUpdateAllSettings: role.canUpdateAllSettings,
    canAccessAllTools: role.canAccessAllTools,
    description: role.description,
    icon: role.icon,
    isEditable: role.isEditable,
    canReadAllObjectRecords: role.canReadAllObjectRecords,
    canUpdateAllObjectRecords: role.canUpdateAllObjectRecords,
    canSoftDeleteAllObjectRecords: role.canSoftDeleteAllObjectRecords,
    canDestroyAllObjectRecords: role.canDestroyAllObjectRecords,
    roleTargets: role.roleTargets,
  };
};

export const fromRoleEntitiesToRoleDtos = (roleEntities: RoleEntity[]) =>
  roleEntities.map(fromRoleEntityToRoleDto);
