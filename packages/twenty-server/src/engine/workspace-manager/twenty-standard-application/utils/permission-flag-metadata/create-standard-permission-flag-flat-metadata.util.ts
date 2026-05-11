import { v4 } from 'uuid';

import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import { STANDARD_PERMISSION_FLAG } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-permission-flag.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type AllStandardPermissionFlagName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-permission-flag-name.type';
import { type StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';

export type CreateStandardPermissionFlagContext = {
  permissionFlagName: AllStandardPermissionFlagName;
};

export type CreateStandardPermissionFlagArgs =
  StandardBuilderArgs<'permissionFlag'> & {
    context: CreateStandardPermissionFlagContext;
  };

export const createStandardPermissionFlagFlatMetadata = ({
  context: { permissionFlagName },
  workspaceId,
  twentyStandardApplicationId,
  now,
}: CreateStandardPermissionFlagArgs): FlatPermissionFlag => {
  const metadata =
    STANDARD_PERMISSION_FLAG[permissionFlagName];

  return {
    id: v4(),
    universalIdentifier: metadata.universalIdentifier,
    key: permissionFlagName,
    label: metadata.label,
    description: metadata.description,
    iconKey: metadata.iconKey,
    permissionType: metadata.permissionType,
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
