import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type CreateRoleInput } from 'src/engine/metadata-modules/role/dtos/create-role-input.dto';

export const fromCreateRoleInputToFlatRoleToCreate = ({
  createRoleInput,
  workspaceId,
  flatApplication,
}: {
  createRoleInput: CreateRoleInput;
  workspaceId: string;
  flatApplication: FlatApplication;
}): FlatRole => {
  const now = new Date().toISOString();

  const {
    label,
    description,
    icon,
    id: inputId,
  } = trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
    createRoleInput,
    ['description', 'icon', 'id', 'label'],
  );
  const id = inputId ?? v4();

  return {
    id,
    label,
    description: description ?? null,
    icon: icon ?? null,
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
    universalIdentifier: createRoleInput.universalIdentifier ?? v4(),
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    roleTargetIds: [],
    roleTargetUniversalIdentifiers: [],
    objectPermissionIds: [],
    permissionFlagIds: [],
    fieldPermissionIds: [],
    rowLevelPermissionPredicateIds: [],
    rowLevelPermissionPredicateUniversalIdentifiers: [],
    rowLevelPermissionPredicateGroupIds: [],
    rowLevelPermissionPredicateGroupUniversalIdentifiers: [],
  };
};
