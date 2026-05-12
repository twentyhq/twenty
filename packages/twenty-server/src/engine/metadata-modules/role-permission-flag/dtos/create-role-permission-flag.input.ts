import { PermissionFlagType } from 'twenty-shared/constants';

export type CreateRolePermissionFlagInput = {
  roleId: string;
  flag: PermissionFlagType;
  universalIdentifier?: string;
};
