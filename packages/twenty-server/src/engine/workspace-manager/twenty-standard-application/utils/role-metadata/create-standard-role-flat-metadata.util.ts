import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export type CreateStandardRoleContext = {
  universalIdentifier: string;
  standardId: string;
  label: string;
  description: string | null;
  icon: string | null;
  isEditable: boolean;
  canUpdateAllSettings: boolean;
  canAccessAllTools: boolean;
  canReadAllObjectRecords: boolean;
  canUpdateAllObjectRecords: boolean;
  canSoftDeleteAllObjectRecords: boolean;
  canDestroyAllObjectRecords: boolean;
  canBeAssignedToUsers: boolean;
  canBeAssignedToAgents: boolean;
  canBeAssignedToApiKeys: boolean;
  canBeAssignedToApplications: boolean;
};

export type CreateStandardRoleArgs = {
  workspaceId: string;
  twentyStandardApplicationId: string;
  now: string;
  context: CreateStandardRoleContext;
  standardRoleRelatedEntityIds: Record<string, { id: string }>;
  roleName: string;
};

export const createStandardRoleFlatMetadata = ({
  context: {
    universalIdentifier,
    standardId,
    label,
    description,
    icon,
    isEditable,
    canUpdateAllSettings,
    canAccessAllTools,
    canReadAllObjectRecords,
    canUpdateAllObjectRecords,
    canSoftDeleteAllObjectRecords,
    canDestroyAllObjectRecords,
    canBeAssignedToUsers,
    canBeAssignedToAgents,
    canBeAssignedToApiKeys,
    canBeAssignedToApplications,
  },
  workspaceId,
  twentyStandardApplicationId,
  now,
  standardRoleRelatedEntityIds,
  roleName,
}: CreateStandardRoleArgs): FlatRole => ({
  id: standardRoleRelatedEntityIds[roleName].id,
  universalIdentifier,
  standardId,
  label,
  description,
  icon,
  isEditable,
  canUpdateAllSettings,
  canAccessAllTools,
  canReadAllObjectRecords,
  canUpdateAllObjectRecords,
  canSoftDeleteAllObjectRecords,
  canDestroyAllObjectRecords,
  canBeAssignedToUsers,
  canBeAssignedToAgents,
  canBeAssignedToApiKeys,
  canBeAssignedToApplications,
  workspaceId,
  applicationId: twentyStandardApplicationId,
  createdAt: now,
  updatedAt: now,
  permissionFlagIds: [],
  fieldPermissionIds: [],
  objectPermissionIds: [],
  roleTargetIds: [],
});
