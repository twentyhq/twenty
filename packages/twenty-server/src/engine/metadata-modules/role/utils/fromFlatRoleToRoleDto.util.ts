import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';

export const fromFlatRoleToRoleDto = ({
  canAccessAllTools,
  canBeAssignedToAgents,
  canBeAssignedToApiKeys,
  canBeAssignedToUsers,
  canDestroyAllObjectRecords,
  canReadAllObjectRecords,
  canSoftDeleteAllObjectRecords,
  canUpdateAllObjectRecords,
  canUpdateAllSettings,
  id,
  isEditable,
  label,
}: FlatRole): RoleDTO => {
  return {
    canAccessAllTools,
    canBeAssignedToAgents,
    canBeAssignedToApiKeys,
    canBeAssignedToUsers,
    canDestroyAllObjectRecords,
    canReadAllObjectRecords,
    canSoftDeleteAllObjectRecords,
    canUpdateAllObjectRecords,
    canUpdateAllSettings,
    id,
    isEditable,
    label,
  };
};
