import { v4 } from 'uuid';

import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type CreateRoleInput } from 'src/engine/metadata-modules/role/dtos/create-role-input.dto';

export const fromCreateRoleInputToFlatRoleToCreate = ({
  createRoleInput,
  workspaceId,
}: {
  createRoleInput: CreateRoleInput;
  workspaceId: string;
}): FlatRole => {
  const now = new Date();

  const id = createRoleInput.id ?? v4();
  return {
    id,
    standardId: null,
    label: createRoleInput.label,
    description: createRoleInput.description ?? null,
    icon: createRoleInput.icon ?? null,
    canUpdateAllSettings: createRoleInput.canUpdateAllSettings ?? false,
    canAccessAllTools: createRoleInput.canAccessAllTools ?? false,
    canReadAllObjectRecords: createRoleInput.canReadAllObjectRecords ?? false,
    canUpdateAllObjectRecords:
      createRoleInput.canUpdateAllObjectRecords ?? false,
    canSoftDeleteAllObjectRecords:
      createRoleInput.canSoftDeleteAllObjectRecords ?? false,
    canDestroyAllObjectRecords:
      createRoleInput.canDestroyAllObjectRecords ?? false,
    canBeAssignedToUsers: createRoleInput.canBeAssignedToUsers ?? true,
    canBeAssignedToAgents: createRoleInput.canBeAssignedToAgents ?? true,
    canBeAssignedToApiKeys: createRoleInput.canBeAssignedToApiKeys ?? true,
    isEditable: true,
    workspaceId,
    createdAt: now,
    updatedAt: now,
    universalIdentifier: id,
    applicationId: null,
    roleTargetIds: [],
    objectPermissionIds: [],
    permissionFlagIds: [],
    fieldPermissionIds: [],
  };
};
