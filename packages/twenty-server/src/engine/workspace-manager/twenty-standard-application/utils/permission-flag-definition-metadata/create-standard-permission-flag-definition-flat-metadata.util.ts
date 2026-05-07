import { v4 } from 'uuid';

import { type FlatPermissionFlagDefinition } from 'src/engine/metadata-modules/flat-permission-flag-definition/types/flat-permission-flag-definition.type';
import { STANDARD_PERMISSION_FLAG_DEFINITION } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-permission-flag-definition.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type AllStandardPermissionFlagDefinitionName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-permission-flag-definition-name.type';
import { type StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';

export type CreateStandardPermissionFlagDefinitionContext = {
  permissionFlagDefinitionName: AllStandardPermissionFlagDefinitionName;
};

export type CreateStandardPermissionFlagDefinitionArgs =
  StandardBuilderArgs<'permissionFlagDefinition'> & {
    context: CreateStandardPermissionFlagDefinitionContext;
  };

export const createStandardPermissionFlagDefinitionFlatMetadata = ({
  context: { permissionFlagDefinitionName },
  workspaceId,
  twentyStandardApplicationId,
  now,
}: CreateStandardPermissionFlagDefinitionArgs): FlatPermissionFlagDefinition => {
  const metadata =
    STANDARD_PERMISSION_FLAG_DEFINITION[permissionFlagDefinitionName];

  return {
    id: v4(),
    universalIdentifier: metadata.universalIdentifier,
    key: permissionFlagDefinitionName,
    label: metadata.label,
    description: metadata.description,
    iconKey: metadata.iconKey,
    category: metadata.category,
    isRelevantForAgents: metadata.isRelevantForAgents,
    isRelevantForUsers: metadata.isRelevantForUsers,
    isRelevantForApiKeys: metadata.isRelevantForApiKeys,
    isCustom: false,
    workspaceId,
    applicationId: twentyStandardApplicationId,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    createdAt: now,
    updatedAt: now,
  };
};
