import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import { type CreatePermissionFlagInput } from 'src/engine/metadata-modules/permission-flag/dtos/create-permission-flag.input';

export const fromCreatePermissionFlagInputToFlatPermissionFlagToCreate = ({
  createPermissionFlagInput,
  workspaceId,
  flatApplication,
}: {
  createPermissionFlagInput: CreatePermissionFlagInput;
  workspaceId: string;
  flatApplication: FlatApplication;
}): FlatPermissionFlag => {
  const now = new Date().toISOString();

  const { key, label, description, iconKey } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      createPermissionFlagInput,
      ['key', 'label', 'description', 'iconKey'],
    );

  const id = createPermissionFlagInput.id ?? v4();
  const universalIdentifier =
    createPermissionFlagInput.universalIdentifier ?? id;

  return {
    id,
    universalIdentifier,
    key,
    label,
    description: description ?? null,
    iconKey: iconKey ?? null,
    permissionType: createPermissionFlagInput.permissionType,
    isRelevantForAgents: createPermissionFlagInput.isRelevantForAgents ?? false,
    isRelevantForUsers: createPermissionFlagInput.isRelevantForUsers ?? false,
    isRelevantForApiKeys:
      createPermissionFlagInput.isRelevantForApiKeys ?? false,
    isCustom: true,
    workspaceId,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    rolePermissionFlagIds: [],
    rolePermissionFlagUniversalIdentifiers: [],
    createdAt: now,
    updatedAt: now,
  };
};
