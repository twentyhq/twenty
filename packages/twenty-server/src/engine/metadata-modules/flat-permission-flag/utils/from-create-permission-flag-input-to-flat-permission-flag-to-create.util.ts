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

  const { key, label, description, icon } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      createPermissionFlagInput,
      ['key', 'label', 'description', 'icon'],
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
    icon: icon ?? null,
    permissionType: createPermissionFlagInput.permissionType,
    workspaceId,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    rolePermissionFlagIds: [],
    rolePermissionFlagUniversalIdentifiers: [],
    createdAt: now,
    updatedAt: now,
  };
};
