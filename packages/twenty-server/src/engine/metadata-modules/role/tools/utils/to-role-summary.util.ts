import { type RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';

type ObjectPermissionFields = {
  objectMetadataId: string;
  canReadObjectRecords?: boolean;
  canUpdateObjectRecords?: boolean;
  canSoftDeleteObjectRecords?: boolean;
  canDestroyObjectRecords?: boolean;
};

// Narrows to the permission booleans the model needs, dropping restrictedFields
// and the nested row-level predicate arrays that would bloat the tool output.
export const toObjectPermissionSummary = (
  objectPermission: ObjectPermissionFields,
) => ({
  objectMetadataId: objectPermission.objectMetadataId,
  canReadObjectRecords: objectPermission.canReadObjectRecords,
  canUpdateObjectRecords: objectPermission.canUpdateObjectRecords,
  canSoftDeleteObjectRecords: objectPermission.canSoftDeleteObjectRecords,
  canDestroyObjectRecords: objectPermission.canDestroyObjectRecords,
});

export const toRoleSummary = (role: RoleDTO) => ({
  id: role.id,
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
  objectPermissions: role.objectPermissions?.map(toObjectPermissionSummary),
  permissionFlags: role.permissionFlags?.map(
    (permissionFlag) => permissionFlag.flag,
  ),
});
