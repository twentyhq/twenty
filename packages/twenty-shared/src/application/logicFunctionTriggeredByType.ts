import { type PermissionFlagType } from '@/constants/PermissionFlagType';

export type LogicFunctionTriggeredBy = {
  userId: string;
  userWorkspaceId: string;
  workspaceMemberId: string | null;
  permissionFlags: PermissionFlagType[];
};
