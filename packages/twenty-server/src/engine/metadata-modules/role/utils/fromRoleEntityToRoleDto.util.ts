import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

export const fromRoleEntityToRoleDto = ({
  id,
  label,
  canUpdateAllSettings,
  description,
  icon,
  isEditable,
  userWorkspaceRoles,
  canReadAllObjectRecords,
  canUpdateAllObjectRecords,
  canSoftDeleteAllObjectRecords,
  canDestroyAllObjectRecords,
}: RoleEntity): RoleDTO => {
  return {
    id,
    label,
    canUpdateAllSettings,
    description,
    icon,
    isEditable,
    userWorkspaceRoles,
    canReadAllObjectRecords,
    canUpdateAllObjectRecords,
    canSoftDeleteAllObjectRecords,
    canDestroyAllObjectRecords,
  };
};

export const fromRoleEntitiesToRoleDtos = (roleEntities: RoleEntity[]) =>
  roleEntities.map(fromRoleEntityToRoleDto);
