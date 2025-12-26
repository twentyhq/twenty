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
    canBeAssignedToUsers: role.canBeAssignedToUsers,
    canBeAssignedToAgents: role.canBeAssignedToAgents,
    canBeAssignedToApiKeys: role.canBeAssignedToApiKeys,
    workspaceId: role.workspaceId,
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
    universalIdentifier: role.universalIdentifier ?? role.standardId ?? role.id,
    applicationId: role.applicationId ?? null,
    roleTargetIds: role.roleTargets.map((rt) => rt.id),
    objectPermissionIds: role.objectPermissions.map((op) => op.id),
    permissionFlagIds: role.permissionFlags.map((pf) => pf.id),
    fieldPermissionIds: role.fieldPermissions.map((fp) => fp.id),
  };
};
