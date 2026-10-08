import { PermissionFlagType } from 'twenty-shared/constants';
import { type AllMetadataName } from 'twenty-shared/metadata';

export const REQUIRED_PERMISSION_FLAG_BY_BROADCAST_ENTITY_NAME = {
  workflow: PermissionFlagType.WORKFLOWS,
  workflowVersion: PermissionFlagType.WORKFLOWS,
} as const satisfies Partial<Record<AllMetadataName, PermissionFlagType>>;

export const getRequiredPermissionFlagForBroadcastEntityName = (
  entityName: string,
): PermissionFlagType | undefined =>
  REQUIRED_PERMISSION_FLAG_BY_BROADCAST_ENTITY_NAME[
    entityName as keyof typeof REQUIRED_PERMISSION_FLAG_BY_BROADCAST_ENTITY_NAME
  ];
