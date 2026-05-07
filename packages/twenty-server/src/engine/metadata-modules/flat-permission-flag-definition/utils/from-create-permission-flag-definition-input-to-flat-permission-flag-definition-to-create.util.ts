import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatPermissionFlagDefinition } from 'src/engine/metadata-modules/flat-permission-flag-definition/types/flat-permission-flag-definition.type';
import { type CreatePermissionFlagDefinitionInput } from 'src/engine/metadata-modules/permission-flag-definition/dtos/create-permission-flag-definition.input';

export const fromCreatePermissionFlagDefinitionInputToFlatPermissionFlagDefinitionToCreate =
  ({
    createPermissionFlagDefinitionInput,
    workspaceId,
    flatApplication,
  }: {
    createPermissionFlagDefinitionInput: CreatePermissionFlagDefinitionInput;
    workspaceId: string;
    flatApplication: FlatApplication;
  }): FlatPermissionFlagDefinition => {
    const now = new Date().toISOString();

    const { key, label, description, iconKey } =
      trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
        createPermissionFlagDefinitionInput,
        ['key', 'label', 'description', 'iconKey'],
      );

    const id = createPermissionFlagDefinitionInput.id ?? v4();
    const universalIdentifier =
      createPermissionFlagDefinitionInput.universalIdentifier ?? id;

    return {
      id,
      universalIdentifier,
      key,
      label,
      description: description ?? null,
      iconKey: iconKey ?? null,
      category: createPermissionFlagDefinitionInput.category,
      isRelevantForAgents:
        createPermissionFlagDefinitionInput.isRelevantForAgents ?? false,
      isRelevantForUsers:
        createPermissionFlagDefinitionInput.isRelevantForUsers ?? false,
      isRelevantForApiKeys:
        createPermissionFlagDefinitionInput.isRelevantForApiKeys ?? false,
      isCustom: true,
      workspaceId,
      applicationId: flatApplication.id,
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
      createdAt: now,
      updatedAt: now,
    };
  };
