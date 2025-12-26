import { v4 } from 'uuid';

import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';
import { type AllStandardRoleName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-role-name.type';
import { type StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';

export type CreateStandardRoleContext = {
  roleName: AllStandardRoleName;
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
};

export type CreateStandardRoleArgs = StandardBuilderArgs<'role'> & {
  context: CreateStandardRoleContext;
};

export const createStandardRoleFlatMetadata = ({
  context: {
    roleName,
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
  },
  workspaceId,
  twentyStandardApplicationId,
  now,
}: CreateStandardRoleArgs): FlatRole => {
  const universalIdentifier = STANDARD_ROLE[roleName].universalIdentifier;

  return {
    id: v4(),
    universalIdentifier,
    standardId: universalIdentifier,
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
    workspaceId,
    applicationId: twentyStandardApplicationId,
    createdAt: now,
    updatedAt: now,
    permissionFlagIds: [],
    fieldPermissionIds: [],
    objectPermissionIds: [],
    roleTargetIds: [],
  };
};
