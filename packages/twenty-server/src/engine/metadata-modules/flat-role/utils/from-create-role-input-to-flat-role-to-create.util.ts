import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CreateRoleInput } from 'src/engine/metadata-modules/role/dtos/create-role-input.dto';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';

export const fromCreateRoleInputToFlatRoleToCreate = ({
  createRoleInput,
  flatApplication,
}: {
  createRoleInput: CreateRoleInput;
  flatApplication: FlatApplication;
}): UniversalFlatRole => {
  const now = new Date().toISOString();

  const { label, description, icon } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      createRoleInput,
      ['description', 'icon', 'id', 'label'],
    );

  return {
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
    createdAt: now,
    updatedAt: now,
    universalIdentifier: v4(),
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    roleTargetUniversalIdentifiers: [],
    rowLevelPermissionPredicateUniversalIdentifiers: [],
    rowLevelPermissionPredicateGroupUniversalIdentifiers: [],
  };
};
