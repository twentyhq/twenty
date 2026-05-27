import { type PermissionFlagType } from 'twenty-shared/constants';

export type CreateRolePermissionFlagInput = {
  roleId: string;
  permissionFlagId: string;
  flag: PermissionFlagType;
  universalIdentifier?: string;
};
