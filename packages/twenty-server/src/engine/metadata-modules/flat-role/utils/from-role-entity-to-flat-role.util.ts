import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

export const fromRoleEntityToFlatRole = (role: RoleEntity): FlatRole => {
  return {
    id: role.id,
    standardId: role.standardId,
    label: role.label,
    description: role.description,
    icon: role.icon,
    isEditable: role.isEditable,
    canUpdateAllSettings: role.canUpdateAllSettings,
    canAccessAllTools: role.canAccessAllTools,
    canReadAllObjectRecords: role.canReadAllObjectRecords,
    canUpdateAllObjectRecords: role.canUpdateAllObjectRecords,
    canSoftDeleteAllObjectRecords: role.canSoftDeleteAllObjectRecords,
    canDestroyAllObjectRecords: role.canDestroyAllObjectRecords,
    workspaceId: role.workspaceId,
    uniqueIdentifier: role.standardId || role.id,
  };
};
