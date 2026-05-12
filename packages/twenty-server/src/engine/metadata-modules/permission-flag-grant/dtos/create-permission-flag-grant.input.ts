import { PermissionFlagType } from 'twenty-shared/constants';

export type CreatePermissionFlagGrantInput = {
  roleId: string;
  flag: PermissionFlagType;
  universalIdentifier?: string;
};
