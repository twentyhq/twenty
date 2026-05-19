import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import {
  STANDARD_PERMISSION_FLAG_DEFINITIONS,
  type StandardPermissionFlagDefinition,
} from 'src/engine/metadata-modules/permission-flag/constants/standard-permission-flag-definitions.constant';

const STANDARD_PERMISSION_FLAG_DEFINITION_BY_KEY: Record<
  PermissionFlagType,
  StandardPermissionFlagDefinition
> = STANDARD_PERMISSION_FLAG_DEFINITIONS.reduce(
  (accumulator, definition) => {
    accumulator[definition.key] = definition;

    return accumulator;
  },
  {} as Record<PermissionFlagType, StandardPermissionFlagDefinition>,
);

const SYNTHESIZED_TIMESTAMP = new Date(0).toISOString();

// TODO: Remove this once we have a proper permission flag catalog backfilled
export const synthesizeFlatPermissionFlagFromFlag = ({
  flag,
  workspaceId,
  applicationId,
  applicationUniversalIdentifier,
}: {
  flag: PermissionFlagType;
  workspaceId: string;
  applicationId: string;
  applicationUniversalIdentifier: string;
}): FlatPermissionFlag => {
  const definition = STANDARD_PERMISSION_FLAG_DEFINITION_BY_KEY[flag];
  const universalIdentifier = SystemPermissionFlag[flag];

  return {
    id: universalIdentifier,
    universalIdentifier,
    workspaceId,
    applicationId,
    applicationUniversalIdentifier,
    key: flag,
    label: definition.label,
    description: definition.description,
    icon: definition.icon,
    permissionType: definition.permissionType,
    rolePermissionFlagIds: [],
    rolePermissionFlagUniversalIdentifiers: [],
    createdAt: SYNTHESIZED_TIMESTAMP,
    updatedAt: SYNTHESIZED_TIMESTAMP,
  };
};
