import { PermissionFlagType } from 'twenty-shared/constants';

export const REQUIRED_PERMISSION_FLAG_BY_BROADCAST_ENTITY_NAME: Partial<
  Record<string, PermissionFlagType>
> = {
  workflow: PermissionFlagType.WORKFLOWS,
  workflowVersion: PermissionFlagType.WORKFLOWS,
};
