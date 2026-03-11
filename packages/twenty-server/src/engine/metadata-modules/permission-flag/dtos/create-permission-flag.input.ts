import { PermissionFlagType } from 'twenty-shared/constants';

export type CreatePermissionFlagInput = {
  roleId: string;
  flag: PermissionFlagType;
  universalIdentifier?: string;
};
