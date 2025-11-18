import { v4 as uuidv4 } from 'uuid';

import { type CreateRoleInput } from 'src/engine/metadata-modules/role/dtos/create-role-input.dto';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export const fromCreateRoleInputToFlatRoleToCreate = ({
  createRoleInput,
  workspaceId,
}: {
  createRoleInput: CreateRoleInput;
  workspaceId: string;
}): FlatRole => {
  const now = new Date();

  return {
    id: createRoleInput.id ?? uuidv4(),
    standardId: '',
    label: createRoleInput.label,
    description: createRoleInput.description ?? '',
    icon: createRoleInput.icon ?? '',
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
    universalIdentifier: '',
    applicationId: null,
    roleTargetIds: [],
    objectPermissionIds: [],
    permissionFlagIds: [],
    fieldPermissionIds: [],
  };
};
